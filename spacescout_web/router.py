class OAuthDBRouter(object):
    """
    A router sending oauth to the right place 
    """
    def db_for_read(self, model, **hints):
        """
        """
        if model._meta.app_label == 'oauth_provider':
            return 'oauth'
        if model._meta.app_label == 'auth':
            return 'oauth'
        return None

    def db_for_write(self, model, **hints):
        """
        """
        if model._meta.app_label == 'oauth_provider':
            return 'oauth'
        if model._meta.app_label == 'auth':
            return 'oauth'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, model):
        """
        Make sure the auth app only appears in the 'auth_db'
        database.
        """
        if db == 'oauth':
            return model._meta.app_label == 'oauth_provider'
        elif model._meta.app_label == 'oauth_provider':
            return False
        return None 
