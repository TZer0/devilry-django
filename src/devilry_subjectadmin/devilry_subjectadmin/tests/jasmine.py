from devilry.apps.jsapp.seleniumhelpers import SeleniumTestCase

class TestJasmine(SeleniumTestCase):
    appname = 'subjectadmin'
    def test_jasmine(self):
        self.runJasmineTests()