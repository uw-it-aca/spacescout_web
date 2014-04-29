from django.template import Context, loader
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.core.context_processors import csrf
from mobility.decorators import mobile_template


# Login prompt
@mobile_template('spacescout_web/{mobile/}login.html')
def Prompt(request, template=None):
    next = request.REQUEST.get('next', '/')

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
    user = authenticate(username=username, password=password)
    if user is not None and user.is_active:
        login(request, user)

    return HttpResponseRedirect(next)

# Logout
def Logout(request):
    logout(request)
    return HttpResponseRedirect(request.REQUEST['next'])
