from django.template import Context, loader
from django.utils.http import is_safe_url
from django.http import HttpResponse, HttpResponseRedirect
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.context_processors import csrf
from mobility.decorators import mobile_template


# Login prompt
@mobile_template('spacescout_web/{mobile/}login.html')
def Prompt(request, template=None):
    next = request.REQUEST.get('next', '/')
    if not is_safe_url(url=next, host=request.get_host()):
        next = "/"

    if request.user.is_authenticated():
        return HttpResponseRedirect(next)

    t = loader.get_template(template)
    c = Context({
            'next': next
    })
    c.update(csrf(request))
    return HttpResponse(t.render(c))

# Login Authentication
def Login(request):
    username = request.POST['username']
    password = request.POST['password']
    next = request.POST['next']
    if not is_safe_url(url=next, host=request.get_host()):
        next = "/"
    user = authenticate(username=username, password=password)

    if user is not None and user.is_active:
        login(request, user)

    return HttpResponseRedirect(next)

# Logout
def Logout(request):
    logout(request)
    if hasattr(settings, 'SS_WEB_LOGOUT_URL'):
        return HttpResponseRedirect(settings.SS_WEB_LOGOUT_URL)
    else:
        return HttpResponseRedirect(request.REQUEST['next'] if 'next' in request.REQUEST else '/')
