import unittest
import settings
from selenium import webdriver

# Page Objects
from login_page import LoginPage
from spacescout_main import SpacescoutMain
from spacescout_filters import SpacescoutFilters
from spacescout_suggest_space import SpacescoutSuggestSpace
from spacescout_thank_you import SpacescoutThankYou

class SpacescoutAutomation(unittest.TestCase):
    def setUp(self):
        # Test variables
        self.valid_name = "lisabot_test"
        self.valid_netid = "lisabot"
        self.valid_email = "lisabot@uw.edu"
        self.valid_building_name = "Odegaard"
        self.valid_floor_number = "2"
        self.valid_room_number = "210"
        self.valid_description = "A space."
        self.valid_justification = "Because."
        
        # Create web driver instance.
        self.driver = webdriver.Firefox()
        
        # Set number of seconds for driver to poll DOM elements before throwing
        # an exception or error.
        n_seconds = 12
        self.driver.implicitly_wait(n_seconds)
        
        # Get SpaceScout website
        self.driver.get(settings.SPACESCOUT_TEST)
        import time;time.sleep(1)
    
    def tearDown(self):
        self.driver.close()
    
    # Suggest page variables:
    # name, netid, email, building_name, floor_number, room_number,
    # description, justification
    def test_suggest_space_valid(self):
        main_page = SpacescoutMain(self.driver)
        suggest_page = main_page.suggest_a_space()
        thank_you_page = suggest_page.suggest_a_space(self.valid_name, 
            self.valid_netid, self.valid_email, self.valid_building_name,
            self.valid_floor_number, self.valid_room_number,
            self.valid_description, self.valid_justification)
    def test_suggest_space_all_fields_empty(self):
        main_page = SpacescoutMain(self.driver)
        suggest_page = main_page.suggest_a_space()
        thank_you_page = suggest_page.suggest_a_space_expecting_failure("",
            "", "", "", "", "", "", "")

if __name__ == '__main__':
    suite = unittest.TestLoader().loadTestsFromTestCase(SpacescoutAutomation)
    unittest.TextTestRunner(verbosity=2).run(suite)  
    #unittest.main()
    
