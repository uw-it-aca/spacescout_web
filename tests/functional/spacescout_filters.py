from selenium.webdriver.common.keys import Keys

class SpacescoutFilters:
    def __init__(self, driver):
        self.driver = driver
        
        # Check that we're on the right page.
        if "SpaceScout" not in driver.title:
            raise Exception("This isn't the correct request page!")
        
        # The filters page contains several HTML elements that will be 
        # represented as WebElements. The locators for these elements
        # should only be defined once.
        self.done_button = self.driver.find_element_by_id("view_results_button")
        self.clear_button = self.driver.find_element_by_id("cancel_results_button")
        
        # Type of space:
        self.study_room = self.driver.find_element_by_id("study_room")
        self.study_area = self.driver.find_element_by_id("study_area")
        self.computer_lab = self.driver.find_element_by_id("computer_lab")
        self.production_studio = self.driver.find_element_by_id("studio")
        self.classroom = self.driver.find_element_by_id("classroom")    # includes conference rooms
        self.open_space = self.driver.find_element_by_id("open")
        self.lounge = self.driver.find_element_by_id("lounge")
        self.cafe = self.driver.find_element_by_id("cafe")
        self.outdoor = self.driver.find_element_by_id("outdoor")
        
        # Reservability:
        self.reservable = self.driver.find_element_by_id("reservable")
        
        # Capacity:
        self.capacity = self.driver.find_element_by_id("capacity")
        
        # Hours:
        self.open_now = self.driver.find_element_by_id("open_now")
        self.specific_time = self.driver.find_element_by_id("hours_list_input")
        # from
        self.day_from = self.driver.find_element_by_id("day-from")
        self.hour_from = self.driver.find_element_by_id("hour-from")
        self.ampm_from = self.driver.find_element_by_id("ampm-from")
        # until
        self.day_until = self.driver.find_element_by_id("day-until")
        self.hour_until = self.driver.find_element_by_id("hour-until")
        self.ampm_until = self.driver.find_element_by_id("ampm-until")
        
        # Location:
        self.entire_campus = self.driver.find_element_by_id("entire_campus")
        self.specific_building = self.driver.find_element_by_id("building_list_input")
        self.building_list = self.driver.find_element_by_id("e9")    # best id ever
        
        # Resources:
        self.whiteboard = self.driver.find_element_by_id("has_whiteboards")
        self.outlets = self.driver.find_element_by_id("has_outlets")
        self.computer = self.driver.find_element_by_id("has_computers")
        self.scanning = self.driver.find_element_by_id("has_scanner")
        self.large_display = self.driver.find_element_by_id("has_displays")
        self.projector = self.driver.find_element_by_id("has_projector")
        self.printing = self.driver.find_element_by_id("has_printing")
        
        # Noise Level:
        self.silent = self.driver.find_element_by_id("silent")
        self.low_hum = self.driver.find_element_by_id("quiet")
        self.chatter = self.driver.find_element_by_id("moderate")
        
        # Lighting:
        self.natural_light = self.driver.find_element_by_id("lighting")
        
        # Food/Coffee
        self.in_space = self.driver.find_element_by_id("space")
        self.in_building = self.driver.find_element_by_id("building")
        self.in_neighboring = self.driver.find_element_by_id("neighboring")
    
    def done(self):
        self.done_button.click()
        
        from spacescout_main import SpacescoutMain
        return SpacescoutMain(self.driver)
    
    def clear(self):
        self.clear_button.click()
        
        from spacescout_main import SpacescoutMain
        return SpacescoutMain(self.driver)
    
    #---------------------------------------------------------------------------
    # Type of space
    #---------------------------------------------------------------------------
    
    def select_study_room(self):
        if not self.study_room.is_selected():
            self.study_room.click()
        
        return self
    
    def deselect_study_room(self):
        if self.study_room.is_selected():
            self.study_room.click()
        
        return self
    
    def select_study_area(self):
        if not self.study_area.is_selected():
            self.study_area.click()
        
        return self
    
    def deselect_study_area(self):
        if self.study_area.is_selected():
            self.study_area.click()
        
        return self
    
    def select_computer_lab(self):
        if not self.computer_lab.is_selected():
            self.computer_lab.click()
            
        return self
    
    def deselect_computer_lab(self):
        if self.computer_lab.is_selected():
            self.computer_lab.click()
        
        return self
    
    def select_production_studio(self):
        if not self.production_studio.is_selected():
            self.production_studio.click()
            
        return self
    
    def deselect_production_studio(self):
        if self.production_studio.is_selected():
            self.production_studio.click()
        
        return self
    
    def select_classroom(self):
        if not self.classroom.is_selected():
            self.classroom.click()
            
        return self
    
    def deselect_classroom(self):
        if self.classroom.is_selected():
            self.classroom.click()
        
        return self
    
    def select_open_space(self):
        if not self.open_space.is_selected():
            self.open_space.click()
            
        return self
    
    def deselect_open_space(self):
        if self.open_space.is_selected():
            self.open_space.click()
        
        return self
    
    def select_lounge(self):
        if not self.lounge.is_selected():
            self.lounge.click()
            
        return self
    
    def deselect_lounge(self):
        if self.lounge.is_selected():
            self.lounge.click()
        
        return self
    
    def select_cafe(self):
        if not self.cafe.is_selected():
            self.cafe.click()
            
        return self
    
    def deselect_cafe(self):
        if self.cafe.is_selected():
            self.cafe.click()
        
        return self
    
    def select_outdoor(self):
        if not self.outdoor.is_selected():
            self.outdoor.click()
            
        return self
    
    def deselect_outdoor(self):
        if self.outdoor.is_selected():
            self.outdoor.click()
        
        return self
    
    
    #---------------------------------------------------------------------------
    # Reservability
    #---------------------------------------------------------------------------
    
    def select_reservable(self):
        if not self.reservable.is_selected():
            self.reservable.click()
            
        return self
    
    def deselect_reservable(self):
        if self.reservable.is_selected():
            self.reservable.click()
        
        return self
    
    
    #---------------------------------------------------------------------------
    # Hours
    #---------------------------------------------------------------------------
    
    def select_specific_time(self):
        self.specific_time.click()
            
        return self
    
    def select_open_now(self):
        self.open_now.click()
        
        return self
    
    
    #---------------------------------------------------------------------------
    # Location
    #---------------------------------------------------------------------------
    
    def select_entire_campus(self):
        self.entire_campus.click()
            
        return self
    
    def select_specific_building(self):
        self.specific_building.click()
        
        return self
    
    def select_specify_building(self, building):
        self.select_specific_building()
        self.building_list.click()
        self.building_list.send_keys(building + Keys.RETURN)
        
        return self
    
    
    #---------------------------------------------------------------------------
    # Resources
    #---------------------------------------------------------------------------
    
    def select_whiteboard(self):
        if not self.whiteboard.is_selected():
            self.whiteboard.click()
            
        return self
    
    def deselect_whiteboard(self):
        if self.whiteboard.is_selected():
            self.whiteboard.click()
        
        return self
    
    def select_outlets(self):
        if not self.outlets.is_selected():
            self.outlets.click()
            
        return self
    
    def deselect_outlets(self):
        if self.outlets.is_selected():
            self.outlets.click()
        
        return self
    
    def select_computer(self):
        if not self.computer.is_selected():
            self.computer.click()
            
        return self
    
    def deselect_computer(self):
        if self.computer.is_selected():
            self.computer.click()
        
        return self
    
    def select_scanning(self):
        if not self.scanning.is_selected():
            self.scanning.click()
            
        return self
    
    def deselect_scanning(self):
        if self.scanning.is_selected():
            self.scanning.click()
        
        return self
    
    def select_large_display(self):
        if not self.large_display.is_selected():
            self.large_display.click()
            
        return self
    
    def deselect_large_display(self):
        if self.large_display.is_selected():
            self.large_display.click()
        
        return self
    
    def select_projector(self):
        if not self.projector.is_selected():
            self.projector.click()
            
        return self
    
    def deselect_projector(self):
        if self.projector.is_selected():
            self.projector.click()
        
        return self
    
    def select_printing(self):
        if not self.printing.is_selected():
            self.printing.click()
            
        return self
    
    def deselect_printing(self):
        if self.printing.is_selected():
            self.printing.click()
        
        return self
    
    
    #---------------------------------------------------------------------------
    # Noise level
    #---------------------------------------------------------------------------
    
    def select_silent(self):
        if not self.silent.is_selected():
            self.silent.click()
            
        return self
    
    def deselect_silent(self):
        if self.silent.is_selected():
            self.silent.click()
        
        return self
    
    def select_low_hum(self):
        if not self.low_hum.is_selected():
            self.low_hum.click()
            
        return self
    
    def deselect_low_hum(self):
        if self.low_hum.is_selected():
            self.low_hum.click()
        
        return self
    
    def select_chatter(self):
        if not self.chatter.is_selected():
            self.chatter.click()
            
        return self
    
    def deselect_chatter(self):
        if self.chatter.is_selected():
            self.chatter.click()
        
        return self
    
    
    #---------------------------------------------------------------------------
    # Lighting
    #---------------------------------------------------------------------------
    
    def select_natural_light(self):
        if not self.natural_light.is_selected():
            self.natural_light.click()
            
        return self
    
    def deselect_natural_light(self):
        if self.natural_light.is_selected():
            self.natural_light.click()
        
        return self
    
    
    #---------------------------------------------------------------------------
    # Food/Coffee
    #---------------------------------------------------------------------------
    
    def select_in_space(self):
        if not self.in_space.is_selected():
            self.in_space.click()
            
        return self
    
    def deselect_in_space(self):
        if self.in_space.is_selected():
            self.in_space.click()
        
        return self
    
    def select_in_building(self):
        if not self.in_building.is_selected():
            self.in_building.click()
            
        return self
    
    def deselect_in_building(self):
        if self.in_building.is_selected():
            self.in_building.click()
        
        return self
    
    def select_in_neighboring(self):
        if not self.in_neighboring.is_selected():
            self.in_neighboring.click()
            
        return self
    
    def deselect_in_neighboring(self):
        if self.in_neighboring.is_selected():
            self.in_neighboring.click()
        
        return self
    