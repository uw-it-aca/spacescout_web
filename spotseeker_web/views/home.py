from django.http import HttpResponse
def HomeView(request):
    return HttpResponse("This is the home view")
