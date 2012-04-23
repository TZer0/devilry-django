from datetime import datetime, timedelta
from devilry.apps.core.models import Assignment
from devilry.apps.core.testhelper import TestHelper

from base import SubjectAdminSeleniumTestCase



class TestAssignment(SubjectAdminSeleniumTestCase):
    def setUp(self):
        self.testhelper = TestHelper()
        self.testhelper.create_superuser('grandma')
        self.login('grandma')

    def test_doesnotexists(self):
        self.browseTo('/a/b/c/') # This is not a valid path to an assignment
        self.waitForCssSelector('.assignmentoverview')
        self.waitForCssSelector('.messagemask')
        self.assertTrue('themebase.doesnotexist' in self.selenium.page_source)
        self.assertTrue('a.b.c' in self.selenium.page_source)

    def test_shortcuts_render(self):
        self.testhelper.add(nodes='uni',
                            subjects=['duck1100'],
                            periods=['2012h'],
                            assignments=['week2'])
        self.browseTo('/duck1100/2012h/week2/')
        self.waitForCssSelector('.assignmentoverview')
        self.assertTrue('subjectadmin.assignment.manage_students' in self.selenium.page_source)
        self.assertTrue('subjectadmin.assignment.manage_deadlines' in self.selenium.page_source)

    def test_notpublished(self):
        self.testhelper.add(nodes='uni',
                            subjects=['duck1100'],
                            periods=['2012h'],
                            assignments=['week2:pub(2)'])
        self.browseTo('/duck1100/2012h/week2/')
        self.waitForText('subjectadmin.assignment.notpublished.title')
        self.assertTrue('not published' in self.selenium.page_source)

    def test_published(self):
        self.testhelper.add(nodes='uni',
                            subjects=['duck1100'],
                            periods=['2012h:begins(-2)'],
                            assignments=['week2'])
        self.browseTo('/duck1100/2012h/week2/')
        self.waitForText('subjectadmin.assignment.published.title')
        self.assertTrue('is published' in self.selenium.page_source)


class TestEditPublishingTime(SubjectAdminSeleniumTestCase):
    def setUp(self):
        self.testhelper = TestHelper()
        self.testhelper.create_superuser('grandma')
        self.login('grandma')
        self.testhelper.add(nodes='uni',
                            subjects=['duck1100'],
                            periods=['2012h:begins(-3)'],
                            assignments=['week1'])

        self.browseTo('/duck1100/2012h/week1/')
        self.waitForCssSelector('.editpublishingtime-widget button')
        button = self.selenium.find_element_by_css_selector('.editpublishingtime-widget button')
        button.click()
        self.waitForCssSelector('.editpublishingtime')

        editpublishingtime_window = self.selenium.find_element_by_css_selector('.editpublishingtime')
        self.datefield = editpublishingtime_window.find_element_by_css_selector('.themebase-datefield input')
        self.timefield = editpublishingtime_window.find_element_by_css_selector('.themebase-timefield input')
        self.savebutton = editpublishingtime_window.find_element_by_css_selector('.savebutton button')
        self.cancelbutton = editpublishingtime_window.find_element_by_css_selector('.cancelbutton')
        self.editpublishingtime_window = editpublishingtime_window

    def _set_datetime(self, date, time):
        self.datefield.clear()
        self.timefield.clear()
        self.datefield.send_keys(date)
        self.timefield.send_keys(time)

    def test_editpublishingtime(self):
        self.assertTrue('subjectadmin.assignment.publishing_time.label' in self.selenium.page_source)
        self.assertTrue('subjectadmin.assignment.publishing_time.edithelp' in self.selenium.page_source)
        yesterday = datetime.now() - timedelta(days=1)
        isoday_yesterday = yesterday.date().isoformat()
        self._set_datetime(isoday_yesterday, '12:00')
        self.savebutton.click()
        self.waitForText('{isoday_yesterday} 12:00 is published'.format(**vars())) # If this times out, it has not been updated
        week1 = Assignment.objects.get(pk=self.testhelper.duck1100_2012h_week1.pk)
        self.assertEquals(week1.publishing_time.date(), yesterday.date())

    def test_editpublishingtime_notpublished(self):
        self.assertTrue('subjectadmin.assignment.publishing_time.label' in self.selenium.page_source)
        self.assertTrue('subjectadmin.assignment.publishing_time.edithelp' in self.selenium.page_source)
        tomorrow = datetime.now() + timedelta(days=1)
        isoday_tomorrow = tomorrow.date().isoformat()
        self._set_datetime(isoday_tomorrow, '12:00')
        self.savebutton.click()
        self.waitForText('{isoday_tomorrow} 12:00 not published'.format(**vars())) # If this times out, it has not been updated
        week1 = Assignment.objects.get(pk=self.testhelper.duck1100_2012h_week1.pk)
        self.assertEquals(week1.publishing_time.date(), tomorrow.date())

    def test_cancel(self):
        self.failIfCssSelectorFound(self.editpublishingtime_window, '.x-tool-close')  # Make sure window does not have closable set to true
        self.cancelbutton.click()
        self.assertFalse('.editpublishingtime' in self.selenium.page_source)

    def test_editpublishingtime_errorhandling(self):
        self._set_datetime('2000-02-01', '12:00')
        self.savebutton.click()
        self.waitForText("Publishing time must be within it's period")


class TestEditAnonymous(SubjectAdminSeleniumTestCase):

    def setUp(self):
        self.testhelper = TestHelper()
        self.testhelper.create_superuser('grandma')
        self.login('grandma')
        self.testhelper.add(nodes='uni',
                            subjects=['duck1100'],
                            periods=['2012h:begins(-3)'],
                            assignments=['week1'])

        self.week1 = self.testhelper.duck1100_2012h_week1

        self.browseTo('/duck1100/2012h/week1/')
        self.waitForCssSelector('.editanonymous-widget button')
        button = self.selenium.find_element_by_css_selector('.editanonymous-widget button')
        button.click()
        self.waitForCssSelector('.editanonymous')

        editanonymous_window = self.selenium.find_element_by_css_selector('.editanonymous')
        self.anonymouscheckbox = editanonymous_window.find_element_by_css_selector('input[role="checkbox"]')
        self.savebutton = editanonymous_window.find_element_by_css_selector('.savebutton button')
        self.cancelbutton = editanonymous_window.find_element_by_css_selector('.cancelbutton')
        self.editanonymous_window = editanonymous_window

    def test_editanonymous(self):
        self.assertTrue('subjectadmin.assignment.anonymous.label' in self.selenium.page_source)
        self.assertTrue('subjectadmin.assignment.anonymous.help' in self.selenium.page_source)
        self.anonymouscheckbox.click()
        self.savebutton.click()
        self.waitForText('subjectadmin.assignment.is_anonymous.body') # If this times out, is has not been updated
        self.waitForText('subjectadmin.assignment.is_anonymous.title') # If this times out, is has not been updated
        self.assertTrue(Assignment.objects.get(pk=self.week1.pk).anonymous)

    def test_cancel(self):
        self.failIfCssSelectorFound(self.editanonymous_window, '.x-tool-close') # Make sure window does not have closable set to true
        self.cancelbutton.click()
        self.assertFalse('.editanonymous' in self.selenium.page_source)

    def test_editanonymous_nochange(self):
        self.assertFalse(Assignment.objects.get(pk=self.week1.pk).anonymous)
        self.savebutton.click()
        self.waitForText('subjectadmin.assignment.not_anonymous.title') # If this times out, it has not been updated
        self.waitForText('subjectadmin.assignment.not_anonymous.body') # If this times out, it has not been updated
        week1 = Assignment.objects.get(pk=self.week1.pk)
        self.assertFalse(Assignment.objects.get(pk=self.week1.pk).anonymous)