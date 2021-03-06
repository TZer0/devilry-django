import re
from seleniumhelpers import SeleniumTestCase
from django.test.utils import override_settings
from django.conf import settings
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException


@override_settings(EXTJS4_DEBUG=False)
class SubjectAdminSeleniumTestCase(SeleniumTestCase):

    def browseTo(self, path):
        self.getPath('/devilry_subjectadmin/#' + path)

    def login(self, username, password='test'):
        self.selenium.get('{0}{1}?next=/devilry_subjectadmin/emptytestview'.format(self.live_server_url, settings.LOGIN_URL))
        username_input = self.selenium.find_element_by_name("username")
        username_input.send_keys(username)
        password_input = self.selenium.find_element_by_name("password")
        password_input.send_keys(password)
        self.selenium.find_element_by_xpath('//input[@value="Log in"]').click()

    def get_absolute_url(self, path):
        return '{live_server_url}/devilry_subjectadmin/#{path}'.format(live_server_url=self.live_server_url,
                                                                       path=path)
    def get_breadcrumbstring(self, expected_contains):
        self.waitForCssSelector('.devilry_header_breadcrumb')
        def breadcrumbLoaded(breadcrumb):
            return expected_contains in breadcrumb.text
        breadcrumb = self.selenium.find_element_by_css_selector('.devilry_header_breadcrumb')
        self.waitFor(breadcrumb, breadcrumbLoaded)
        default_breadcrumb = 'Dashboard'
        breadcrumbtext = breadcrumb.text
        if breadcrumb.text.startswith(default_breadcrumb):
            breadcrumbtext = breadcrumbtext[len(default_breadcrumb)+1:]
        return re.split('\s*\/\s*', breadcrumbtext)


class RenameBasenodeTestMixin(object):
    renamebutton_id = None

    def _get_field(self, containercls, fieldname):
        field = self.selenium.find_element_by_css_selector('{0} input[name={1}]'.format(containercls, fieldname))
        return field

    def _init_renametest(self):
        self.selenium.find_element_by_css_selector('#{0} button'.format(self.renamebutton_id)).click()
        self.waitForCssSelector('.devilry_rename_basenode_window')
        window = self.selenium.find_element_by_css_selector('.devilry_rename_basenode_window')
        short_name = self._get_field('.devilry_rename_basenode_window', 'short_name')
        long_name = self._get_field('.devilry_rename_basenode_window', 'long_name')
        savebutton = window.find_element_by_css_selector('.devilry_extjsextras_savebutton button')
        return window, short_name, long_name, savebutton

    def rename_test_helper(self, basenode):
        window, short_name, long_name, savebutton = self._init_renametest()
        self.assertEquals(short_name.get_attribute('value'), basenode.short_name)
        self.assertEquals(long_name.get_attribute('value'), basenode.long_name)

        short_name.clear()
        self.waitForDisabled(savebutton)
        short_name.send_keys('renamed-shortname')
        long_name.clear()
        self.waitForDisabled(savebutton)
        long_name.send_keys('Renamed long name')
        self.waitForEnabled(savebutton)

        savebutton.click()
        self.waitForTitleContains('renamed-shortname')
        updated = basenode.__class__.objects.get(id=basenode.id)
        self.assertEquals(updated.short_name, 'renamed-shortname')
        self.assertEquals(updated.long_name, 'Renamed long name')

    def rename_test_failure_helper(self):
        window, short_name, long_name, savebutton = self._init_renametest()
        short_name.clear()
        short_name.send_keys('Renamed-shortname')
        self.assertEquals(len(self.selenium.find_elements_by_css_selector('.devilry_extjsextras_alertmessagelist .alert-error')), 0)
        savebutton.click()
        self.waitForCssSelector('.devilry_extjsextras_alertmessagelist', within=window)
        self.assertEquals(len(self.selenium.find_elements_by_css_selector('.devilry_extjsextras_alertmessagelist .alert-error')), 1)

class DeleteBasenodeTestMixin(object):
    deletebutton_id = None

    def click_delete_button(self):
        self.selenium.find_element_by_css_selector('#{0} button'.format(self.deletebutton_id)).click()

    def perform_delete(self):
        self.click_delete_button()
        self.waitForCssSelector('.devilry_confirmdeletedialog')
        window = self.selenium.find_element_by_css_selector('.devilry_confirmdeletedialog')
        inputfield = self._get_field('.devilry_confirmdeletedialog', 'confirm_text')
        deletebutton = window.find_element_by_css_selector('.devilry_deletebutton button')
        inputfield.send_keys('DELETE')
        self.waitForEnabled(deletebutton)
        deletebutton.click()


class EditAdministratorsTestMixin(object):
    """
    Test the Edit/manage administrators window.

    Requires ``self.testhelper = TestHelper()`` in ``setUp()`` of supclass, and
    the subclass must implement browseToTestBasenode().
    """
    def browseToTestBasenode(self):
        """
        Browse to the basenode that is returned by :meth:`.getBasenode`.
        """
        raise NotImplementedError()

    def getBasenode(self):
        """
        Get the basenode that is used to test edit admins.
        """
        raise NotImplementedError()

    def _open_edit_administrators_window(self):
        self.waitForCssSelector('.devilry_subjectadmin_adminsbox .edit_link')
        self.selenium.find_element_by_css_selector('.devilry_subjectadmin_adminsbox .edit_link').click()
        self.waitForCssSelector('.devilry_subjectadmin_manageadminspanel')

    def _add_user_via_ui(self, username, query=None):
        query = query or username
        textfield = self.selenium.find_element_by_css_selector('.devilry_usersearch_autocompleteuserwidget input[type=text]')
        textfield.send_keys(query)
        self.waitForCssSelector('.autocompleteuserwidget_matchlist .matchlistitem_{username}'.format(username=username))
        textfield.send_keys(Keys.RETURN)

    def assertUserInEditTable(self, username):
        cssquery = '.devilry_subjectadmin_manageadminspanel .x-grid .prettyformattedusercell_{username}'.format(username=username)
        self.waitForCssSelector(cssquery,
                                msg='User "{username}" not in grid table'.format(username=username))

    def assertUserInAdminsList(self, username):
        cssquery = '.devilry_subjectadmin_administratorlist .administratorlistitem_{username}'.format(username=username)
        self.waitForCssSelector(cssquery,
                               msg='User "{username}" not in administrator list'.format(username=username))

    def assertUserNotInEditTable(self, username):
        cssquery = '.devilry_subjectadmin_manageadminspanel .x-grid .prettyformattedusercell_{username}'.format(username=username)
        self.waitForCssSelectorNotFound(cssquery,
                                        msg='User "{username}" not in grid table'.format(username=username))

    def assertUserNotInAdminsList(self, username):
        cssquery = '.devilry_subjectadmin_administratorlist .administratorlistitem_{username}'.format(username=username)
        self.waitForCssSelectorNotFound(cssquery,
                                        msg='User "{username}" not in administrator list'.format(username=username))

    def test_add_administrators(self):
        self.browseToTestBasenode()
        basenode = self.getBasenode()
        self.assertEquals(basenode.admins.all().count(), 0)
        self._open_edit_administrators_window()

        self.testhelper.create_user('userone')
        self._add_user_via_ui('userone')
        self.assertUserInEditTable('userone')
        self.assertUserInAdminsList('userone')
        self.assertIn(self.testhelper.userone, basenode.admins.all())

        self.testhelper.create_user('usertwo')
        self._add_user_via_ui('usertwo')
        self.assertUserInEditTable('usertwo')
        self.assertUserInAdminsList('usertwo')
        self.assertIn(self.testhelper.usertwo, basenode.admins.all())

        self.assertEquals(basenode.admins.all().count(), 2)

    def test_add_administrator_by_email(self):
        self.browseToTestBasenode()
        basenode = self.getBasenode()
        self.assertEquals(basenode.admins.all().count(), 0)
        self._open_edit_administrators_window()

        self.testhelper.create_user('testuser1')
        self.testhelper.create_user('testuser2')
        user = self.testhelper.create_user('testuser3')
        user.email = 'superman@example.com'
        user.save()
        self._add_user_via_ui('testuser3', query='man@exa')
        self.assertUserInEditTable('testuser3')
        self.assertUserInAdminsList('testuser3')
        self.assertIn(self.testhelper.testuser3, basenode.admins.all())

    def test_add_administrator_by_fullname(self):
        self.browseToTestBasenode()
        basenode = self.getBasenode()
        self.assertEquals(basenode.admins.all().count(), 0)
        self._open_edit_administrators_window()

        self.testhelper.create_user('testuser1')
        self.testhelper.create_user('testuser2')
        user = self.testhelper.create_user('testuser3')
        user.devilryuserprofile.full_name = 'Superman'
        user.devilryuserprofile.save()
        self._add_user_via_ui('testuser3', query='uperma')
        self.assertUserInEditTable('testuser3')
        self.assertUserInAdminsList('testuser3')
        self.assertIn(self.testhelper.testuser3, basenode.admins.all())

    def _get_remove_button(self):
        return self.selenium.find_element_by_css_selector('.devilry_subjectadmin_manageadminspanel .removeButton button')

    def _click_selectall_button(self):
        self.selenium.find_element_by_css_selector('.devilry_subjectadmin_manageadminspanel .selectAllButton button').click()

    def _get_gridcell_cssquery(self, username):
        return '.devilry_subjectadmin_manageadminspanel .x-grid .prettyformattedusercell_{username}'.format(username=username)

    def _get_gridcell(self, username):
        cssquery = self._get_gridcell_cssquery(username)
        self.waitForCssSelector(cssquery, timeout=5)
        return self.selenium.find_element_by_css_selector(cssquery)

    def _select_user(self, username):
        gridcell = self._get_gridcell(username)
        gridcell.click()

    def _remove_using_ui(self):
        self._get_remove_button().click()
        self.waitForCssSelector('.x-message-box')
        def click_yes_button():
            for button in self.selenium.find_elements_by_css_selector('.x-message-box button'):
                if button.text.strip() == 'Yes':
                    button.click()
                    return
            self.fail('Could not find the "Yes" button')
        click_yes_button()

    def test_remove_administrator(self):
        basenode = self.getBasenode()
        basenode.admins.add(self.testhelper.create_user('userone'))
        self.browseToTestBasenode()
        self._open_edit_administrators_window()

        self.assertIn(self.testhelper.userone, basenode.admins.all())
        self.assertUserInEditTable('userone')
        self.assertUserInAdminsList('userone')
        self._select_user('userone')
        self._remove_using_ui()
        self.assertUserNotInEditTable('userone')
        self.assertUserNotInAdminsList('userone')
        self.assertNotIn(self.testhelper.userone, basenode.admins.all())

    def test_remove_many_administrators(self):
        basenode = self.getBasenode()
        basenode.admins.add(self.testhelper.create_user('userone'))
        basenode.admins.add(self.testhelper.create_user('usertwo'))
        basenode.admins.add(self.testhelper.create_user('userthree'))
        self.browseToTestBasenode()
        self._open_edit_administrators_window()

        self.assertEquals(basenode.admins.all().count(), 3)
        self.assertUserInEditTable('userone')
        self.assertUserInEditTable('usertwo')
        self.assertUserInEditTable('userthree')
        self._click_selectall_button()
        self._remove_using_ui()
        self.assertUserNotInEditTable('userone')
        self.assertUserNotInEditTable('usertwo')
        self.assertUserNotInEditTable('userthree')
        self.assertEquals(basenode.admins.all().count(), 0)

    def test_remove_disabled_enabled(self):
        basenode = self.getBasenode()
        basenode.admins.add(self.testhelper.create_user('userone'))
        self.browseToTestBasenode()
        self._open_edit_administrators_window()

        self.assertFalse(self._get_remove_button().is_enabled())
        self._select_user('userone')
        self.assertTrue(self._get_remove_button().is_enabled())

    def test_search(self):
        basenode = self.getBasenode()
        basenode.admins.add(self.testhelper.create_user('userone'))
        basenode.admins.add(self.testhelper.create_user('usertwo'))
        self.browseToTestBasenode()
        self._open_edit_administrators_window()

        searchfield = self.selenium.find_element_by_css_selector('.devilry_subjectadmin_manageadminspanel .searchfield input[type=text]')
        self.assertEquals(len(self.selenium.find_elements_by_css_selector('.devilry_subjectadmin_manageadminspanel .x-grid .prettyformattedusercell')), 2)
        searchfield.send_keys('one')
        self.waitFor(self.selenium,
                     lambda s: len(self.selenium.find_elements_by_css_selector('.devilry_subjectadmin_manageadminspanel .x-grid .prettyformattedusercell')) == 1)
