from devilry.apps.core.testhelper import TestHelper

from .base import SubjectAdminSeleniumTestCase
from .base import RenameBasenodeTestMixin
from .base import DeleteBasenodeTestMixin


class TestSubjectListAll(SubjectAdminSeleniumTestCase):
    def setUp(self):
        self.testhelper = TestHelper()
        self.testhelper.create_superuser('grandma')
        self.testhelper.add(nodes='uni:admin(uniadmin)',
                            subjects=['duck1100:admin(duck1100adm)', 'duck1010:ln(DUCK 1010 - Programming)', 'duck9000'])

    def _geturl(self, subject):
        return '#/subject/{0}/'.format(subject.id)

    def test_listall(self):
        self.login('uniadmin')
        self.browseTo('/')
        self.waitForCssSelector('.devilry_allSubjectsList')
        self.assertTrue('All subjects' in self.selenium.page_source)
        subjectlist = self.selenium.find_element_by_css_selector('.devilry_allSubjectsList')
        self.assertEquals(len(subjectlist.find_elements_by_css_selector('li.devilry_subject')), 3)
        self.assertEquals(len(subjectlist.find_elements_by_css_selector('.devilry_subject_duck1100')), 1)
        self.assertEquals(len(subjectlist.find_elements_by_css_selector('.devilry_subject_duck1010')), 1)
        self.assertEquals(len(subjectlist.find_elements_by_css_selector('.devilry_subject_duck9000')), 1)
        self.assertTrue('DUCK 1010 - Programming' in self.selenium.page_source)
        self.assertTrue(self._geturl(self.testhelper.duck1100) in self.selenium.page_source)
        self.assertTrue(self._geturl(self.testhelper.duck1010) in self.selenium.page_source)
        self.assertTrue(self._geturl(self.testhelper.duck9000) in self.selenium.page_source)

    def test_listall_limited(self):
        self.login('duck1100adm')
        self.browseTo('/')
        self.waitForCssSelector('.devilry_allSubjectsList')
        subjectlist = self.selenium.find_element_by_css_selector('.devilry_allSubjectsList')
        self.assertEquals(len(subjectlist.find_elements_by_css_selector('li.devilry_subject')), 1)




class TestSubjectOverview(SubjectAdminSeleniumTestCase, RenameBasenodeTestMixin, DeleteBasenodeTestMixin):
    def setUp(self):
        self.testhelper = TestHelper()
        self.testhelper.add(nodes='uni:admin(uniadmin,anotheruniadmin)',
                            subjects=['duck1100:admin(duck1100adm)',
                                      'duck1010:ln(DUCK 1010 - Programming):admin(duck1010adm1,duck1010adm2,duck1010adm3)'])
        self.testhelper.add(nodes='uni',
                            subjects=['duck1010'],
                            periods=['period1:ln(Period One)', 'period2:ln(Period Two)', 'period3:ln(Period Three)'])
        self.testhelper.add(nodes='uni',
                            subjects=['duck1100'],
                            periods=['spring01:ln(Spring Year One)'])

    def _get_period_url(self, period):
        return '#/period/{0}/'.format(period.id)

    def _browseToSubject(self, id):
        self.browseTo('/subject/{id}/'.format(id=id))

    def test_doesnotexists(self):
        self.login('duck1010adm1')
        self._browseToSubject(100000)
        self.waitForCssSelector('.alertmessagelist')
        self.assertTrue('403: FORBIDDEN' in self.selenium.page_source)

    def test_doesnotexists_superadmin(self):
        self.testhelper.create_superuser('grandma')
        self.login('grandma')
        self._browseToSubject(100000)
        self.waitForCssSelector('.alertmessagelist')
        self.assertTrue('404: NOT FOUND' in self.selenium.page_source)

    def test_list_of_periods(self):
        self.login('duck1010adm1')
        self._browseToSubject(self.testhelper.duck1010.id)
        self.waitForCssSelector('.devilry_subjectoverview')
        self.waitForText('DUCK 1010 - Programming')
        self.waitForCssSelector('li.devilry_period')
        periodlist = self.selenium.find_element_by_css_selector('.devilry_listofperiods')
        self.assertEquals(len(periodlist.find_elements_by_css_selector('li.devilry_period')), 3)
        self.assertTrue('Period One' in self.selenium.page_source)
        self.assertTrue('Period Two' in self.selenium.page_source)
        self.assertTrue('Period Three' in self.selenium.page_source)
        self.assertFalse('Spring Year One' in self.selenium.page_source)
        self.assertIn(self._get_period_url(self.testhelper.duck1010_period1), self.selenium.page_source)
        self.assertIn(self._get_period_url(self.testhelper.duck1010_period2), self.selenium.page_source)
        self.assertIn(self._get_period_url(self.testhelper.duck1010_period3), self.selenium.page_source)
        self.assertNotIn(self._get_period_url(self.testhelper.duck1100_spring01), self.selenium.page_source)

    def _click_advancedbutton(self):
        advancedButton = self.selenium.find_element_by_css_selector('#menubarAdvancedButton button')
        advancedButton.click()

    def test_menubar(self):
        self.login('duck1010adm1')
        self._browseToSubject(self.testhelper.duck1010.id)
        self.waitForCssSelector('.devilry_subjectoverview')
        self._click_advancedbutton()
        self.waitForText('Delete duck1010')
        self.waitForText('Rename duck1010')
        self.assertEquals(self.selenium.find_element_by_css_selector('#menubarAdvancedDeleteButton .x-menu-item-text').text,
                          'Delete duck1010')
        self.assertEquals(self.selenium.find_element_by_css_selector('#menubarAdvancedRenameButton .x-menu-item-text').text,
                          'Rename duck1010')

    def _get_field(self, containercls, fieldname):
        field = self.selenium.find_element_by_css_selector('{0} input[name={1}]'.format(containercls, fieldname))
        #field.send_keys(value)
        return field

    def test_rename(self):
        self.login('duck1010adm1')
        self._browseToSubject(self.testhelper.duck1010.id)
        self.waitForCssSelector('.devilry_subjectoverview')
        self.rename_test_helper(self.testhelper.duck1010)

    def test_rename_failure(self):
        self.login('duck1010adm1')
        self._browseToSubject(self.testhelper.duck1010.id)
        self.waitForCssSelector('.devilry_subjectoverview')
        self.rename_test_failure_helper()

    def test_delete(self):
        self.testhelper.add(nodes='uni',
                            subjects=['willbedeleted'])
        self.login('uniadmin')
        self._browseToSubject(self.testhelper.willbedeleted.id)
        self.waitForCssSelector('.devilry_subjectoverview')
        subjecturl = self.selenium.current_url
        self.perform_delete()
        self.waitFor(self.selenium, lambda s: s.current_url != subjecturl) # Will time out and fail unless the page is changed after delete

    def test_delete_notparentadmin(self):
        self.testhelper.add(nodes='uni',
                            subjects=['willbedeleted:admin(willbedeletedadm)'])
        self.login('willbedeletedadm')
        self._browseToSubject(self.testhelper.willbedeleted.id)
        self.waitForCssSelector('.devilry_subjectoverview')
        self.click_delete_button()
        self.waitForText('Only superusers can delete non-empty items') # Will time out and fail unless the dialog is shown

    def test_delete_not_empty(self):
        self.login('uniadmin')
        self._browseToSubject(self.testhelper.duck1010.id)
        self.waitForCssSelector('.devilry_subjectoverview')
        self.click_delete_button()
        self.waitForText('Only superusers can delete non-empty items') # Will time out and fail unless the dialog is shown

    def test_title(self):
        self.login('duck1010adm1')
        self._browseToSubject(self.testhelper.duck1010.id)
        self.waitForCssSelector('.devilry_subjectoverview')
        self.assertEquals(self.selenium.title, 'duck1010 - Devilry')

    def test_admins(self):
        self.testhelper.duck1010adm3.devilryuserprofile.full_name = 'Duck1010 admin three'
        self.testhelper.duck1010adm3.devilryuserprofile.save()
        self.login('duck1010adm1')
        self._browseToSubject(self.testhelper.duck1010.id)
        self.waitForCssSelector('.devilry_administratorlist')
        adminlist = self.selenium.find_element_by_css_selector('.devilry_administratorlist')
        self.assertEquals(len(adminlist.find_elements_by_css_selector('li')), 3)
        self.assertTrue('>duck1010adm1<' in self.selenium.page_source)
        self.assertTrue('>duck1010adm2<' in self.selenium.page_source)
        self.assertFalse('>duck1010adm3<' in self.selenium.page_source)
        self.assertTrue('Duck1010 admin three' in self.selenium.page_source)

    def test_inherited_admins(self):
        self.testhelper.uniadmin.devilryuserprofile.full_name = 'Uni admin'
        self.testhelper.uniadmin.devilryuserprofile.save()
        self.login('duck1010adm1')
        self._browseToSubject(self.testhelper.duck1010.id)
        self.waitForCssSelector('.devilry_inherited_administratorlist')
        adminlist = self.selenium.find_element_by_css_selector('.devilry_inherited_administratorlist')
        self.assertEquals(len(adminlist.find_elements_by_css_selector('li')), 2)
        self.assertTrue('>anotheruniadmin<' in self.selenium.page_source)
        self.assertFalse('>uniadmin<' in self.selenium.page_source)
        self.assertTrue('Uni admin' in self.selenium.page_source)

    def test_breadcrumb(self):
        self.login('duck1010adm1')
        self._browseToSubject(self.testhelper.duck1010.id)
        self.waitForCssSelector('.breadcrumb')
        def breadcrumbLoaded(breadcrumb):
            return 'duck1010' in breadcrumb.text
        breadcrumb = self.selenium.find_element_by_css_selector('.breadcrumb')
        self.waitFor(breadcrumb, breadcrumbLoaded)
        self.assertEquals(breadcrumb.text, 'Subjectadmin/All subjects/duck1010')
