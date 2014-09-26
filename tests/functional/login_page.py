class LoginPage:
    # Initializer
    def __init__(self, driver):
        self.driver = driver
        
        '''
        # Check that we're on the right page.
        import time;time.sleep(1)
        if "UW NetID Weblogin" not in self.driver.title:
            raise Exception("This isn't the correct login page!")
        '''
    
        # The login page contains several HTML elements that will be 
        # represented as WebElements. The locators for these elements
        # should only be defined once.
        self.username_field = self.driver.find_element_by_id("weblogin_netid")
        self.password_field = self.driver.find_element_by_id("weblogin_password")
        self.login_button = self.driver.find_element_by_name("submit")
    
    # The login page allows the user to type their username into the username
    # field.
    def type_username(self, username):
        # This is the only place that knows how to enter a username into
        # the username field.
        self.username_field.clear()
        self.username_field.send_keys(username)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another PageObject.
        return self
    
    # The login page allows the user to type their password into the password
    # field.
    def type_password(self, password):
        # This is the only place that knows how to enter a password into
        # the password field.
        self.password_field.clear()
        self.password_field.send_keys(password)
        
        # Return the current page object as this action doesn't navigate
        # to a page represented by another PageObject.
        return self
    
    # The login page allows the user to submit the login form.
    def submit_login(self):
        # This is the only place that submits the login form and expects the
        # destination to be the home page.
        self.login_button.click()
        import time;time.sleep(3)
        
        # Return a new PageObject representing the destination. Should the
        # login page ever go some else (for example, a legal disclaimer), then
        # changing the method signature for this method will mean that all
        # tests that rely on this behavior won't compile.\
        from spacescout_main import SpacescoutMain
        return SpacescoutMain(self.driver)
    
    # The login page allows the user to submit the login form knowing that an
    # invalid username and/or password were entered.
    def submit_login_expecting_failure(self):
        # This is the only place that submits the login form and expects
        # the destination to be the login page due to login failure.
        self.login_button.click()
        
        # Return a new PageObject representing the destination. Should the
        # user ever be navigated to the home page after expecting to fail
        # login, the script will fail when it attempts to instantiate the
        # LoginPage PageObject.
        return LoginPage(self.driver)
    
    # Conceptually, the login page offers the user the service of being able to
    # "log into" the application using a username and password.
    def login_as(self, username, password):
        # Enter username, password, and submit.
        self.type_username(username)
        self.type_password(password)
        
        return self.submit_login()
        
