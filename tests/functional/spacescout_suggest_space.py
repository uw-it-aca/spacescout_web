from selenium.webdriver.common.keys import Keys

class SpacescoutSuggestSpace:
    def __init__(self, driver):
        self.driver = driver
        
        # Check that we're on the right page.
        if "SpaceScout" not in driver.title:
            raise Exception("This isn't SpaceScout!")
        
        # This page contains several HTML elements that will be 
        # represented as WebElements. The locators for these elements
        # should only be defined once.
        self.name_field = self.driver.find_element_by_id("id_name")
        self.netid_field = self.driver.find_element_by_id("id_netid")
        self.email_field = self.driver.find_element_by_id("id_sender")
        self.building_field = self.driver.find_element_by_id("id_building")
        self.floor_field = self.driver.find_element_by_id("id_floor")
        self.room_field = self.driver.find_element_by_id("id_room_number")
        self.description_field = self.driver.find_element_by_id("id_description")
        self.justification_field = self.driver.find_element_by_id("id_justification")
        self.submit_button = self.driver.find_element_by_xpath('//*[@id="main_content"]/form/input')
        
    # The suggest a space page allows the user to type their name
    # into a field.
    def type_name(self, text):
        # This is the only place that knows how to enter a name into
        # the name field.
        self.name_field.clear()
        self.name_field.send_keys(text)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another PageObject.
        return self
    
    # The suggest a space page allows the user to type their UW NetID
    # into a field.
    def type_netid(self, text):
        # This is the only place that knows how to enter a UW NetID into
        # the UW NetID field.
        self.netid_field.clear()
        self.netid_field.send_keys(text)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another PageObject.
        return self
    
    # The suggest a space page allows the user to type their email
    # into a field.
    def type_email(self, text):
        # This is the only place that knows how to enter their email into
        # the email field.
        self.email_field.clear()
        self.email_field.send_keys(text)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another PageObject.
        return self
    
    # The suggest a space page allows the user to type the building name
    # into a field.
    def type_building_name(self, text):
        # This is the only place that knows how to enter the building name into
        # the building name field.
        self.building_field.clear()
        self.building_field.send_keys(text)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another PageObject.
        return self
    
    # The suggest a space page allows the user to type their email
    # into a field.
    def type_floor_number(self, text):
        # This is the only place that knows how to enter the floor number into
        # the floor number field.
        self.floor_field.clear()
        self.floor_field.send_keys(text)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another PageObject.
        return self
    
    # The suggest a space page allows the user to type the room number
    # into a field.
    def type_room_number(self, text):
        # This is the only place that knows how to enter the room number into
        # the room number field.
        self.room_field.clear()
        self.room_field.send_keys(text)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another PageObject.
        return self
    
    # The suggest a space page allows the user to type a description of a space
    # into a field.
    def type_description(self, text):
        # This is the only place that knows how to enter the space description 
        # into the description field.
        self.description_field.clear()
        self.description_field.send_keys(text)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another PageObject.
        return self
    
    # The suggest a space page allows the user to type a justification
    # for a space into a field.
    def type_justification(self, text):
        # This is the only place that knows how to enter the justification for
        # a space into the justification field. 
        self.justification_field.clear()
        self.justification_field.send_keys(text)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another PageObject.
        return self
    
    # Conceptually, the suggest a space page allows the user to suggest a
    # space by filling out a number of fields that provide information
    # on a space.
    def suggest_a_space(self, name, netid, email, building_name, floor_number,
            room_number, description, justification):
        # Fill in information about the space
        self.type_name(name)
        self.type_netid(netid)
        self.type_email(email)
        self.type_building_name(building_name)
        self.type_floor_number(floor_number)
        self.type_room_number(room_number)
        self.type_description(description)
        self.type_justification(justification)
        
        # Return a new Page Object representing the destination. Should the
        # user ever be navigated somewhere other than the thank you
        # page, the script will fail when it attempts to instantiate
        # the Spacescout Thank You Page Object.
        from spacescout_thank_you import SpacescoutThankYou
        return SpacescoutThankYou(self.driver)
    
    # Conceptually, the suggest a space page allows the user to suggest a
    # space by filling out a number of fields that provide information
    # on a space, while expecting failure.
    def suggest_a_space_expecting_failure(self, name, netid, email, 
            building_name, floor_number, room_number, description, 
            justification):
        # Fill in information about the space
        self.type_name(name)
        self.type_netid(netid)
        self.type_email(email)
        self.type_building_name(building_name)
        self.type_floor_number(floor_number)
        self.type_room_number(room_number)
        self.type_description(description)
        self.type_justification(justification)
        
        # Return a new Page Object representing the destination. Should the
        # user ever be navigated somewhere other than the suggest a space
        # page, the script will fail when it attempts to instantiate
        # the Spacescout Suggest a space Page Object.
        return SpacescoutSuggestSpace(self.driver)
    
