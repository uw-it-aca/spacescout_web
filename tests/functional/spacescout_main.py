from selenium.webdriver.common.keys import Keys

class SpacescoutMain:
    def __init__(self, driver):
        self.driver = driver
        
        # Check that we're on the right page.
        if "SpaceScout" not in driver.title:
            raise Exception("This isn't SpaceScout!")
        
        # The main page contains several HTML elements that will be 
        # represented as WebElements. The locators for these elements
        # should only be defined once.
        self.filters = self.driver.find_element_by_id("filter_button")
        self.location = self.driver.find_element_by_id("location_select")
        self.suggest = self.driver.find_element_by_link_text("Suggest a space")
    
    # The main page allows the user to access the filters pane where
    # they may select parameters to search for.
    def open_filters(self):
        # This is the only place that knows how to click the filters button
        # to access the filters pane.
        self.filters.click()
        
        # Return a new Page Object representing the destination. Should the
        # user ever be navigated somewhere other than the filters page, 
        # the script will fail when it attempts to instantiate
        # the Spacescout Filters Page Object.
        from spacescout_filters import SpacescoutFilters
        return SpacescoutFilters(self.driver)
    
    # The main page allows the user to select which location they want to
    # search for.
    def select_location(self, location):
        # This is the only place that knows how to change locations for
        # searching.
        self.location.click()
        self.location.send_keys(location + Keys.RETURN)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another Page Object.
        return self
    
    # The main page allows the user to navigate to the page to suggest a
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
        
        