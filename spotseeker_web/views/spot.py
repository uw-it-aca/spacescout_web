from django.http import HttpResponse
def SpotView(request, spot_id):
    return HttpResponse("This is the spot view")
