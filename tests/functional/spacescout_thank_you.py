class SpacescoutThankYou:
    def __init__(self, driver):
        self.driver = driver
        
        # Check that we're on the right page.
        if "SpaceScout" not in driver.title:
            raise Exception("This isn't SpaceScout!")
        
        # This page contains several HTML elements that will be 
        # represented as WebElements. The locators for these elements
        # should only be defined once.
        self.back = self.driver.find_element_by_id("back_to_space_button")
        self.suggest = self.driver.find_element_by_link_text("Suggest a space")
        
    # The thank you page allows the user to navigate to the page to suggest a
    # space.
    def suggest_a_space(self):
        # This is the only place that knows how to navigate to the suggest
        # a space page.
        self.suggest.click()
        
        # Return a new Page Object representing the destination. Should the
        # user ever be navigated somewhere other than the suggest a space
        # page, the script will fail when it attempts to instantiate
        # the Spacescout Suggest a space Page Object.
        from spacescout_suggest_space import SpacescoutSuggestSpace
        return SpacescoutSuggestSpace(self.driver)
    
    # The thank you page allows the user to go back to the spacescout main
    # page.
    def go_back(self):
        # This is the only place that knows how to go back to the main page.
        self.back.click()
        
        # Return a new Page Object representing the destination. Should the
        # user ever be navigated somewhere other than the main page
        # page, the script will fail when it attempts to instantiate
        # the page object.
        from spacescout_main import SpacescoutMain
        return SpacescoutMain(self.driver)
        