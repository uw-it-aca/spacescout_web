from django.core.management.base import BaseCommand
from django.conf import settings

from spacescout_web.views.home import fetch_open_now_for_campus
from spacescout_web.views.image import get_multi_image

class Command(BaseCommand):
    help = "Fills a cache with the json and image data for open spaces in all campuses"
    def handle(self, *args, **kwargs):
        if not hasattr(settings, 'SS_LOCATIONS'):
            raise("Error running load_open_now_cache - you need to define your locations")

        for location in settings.SS_LOCATIONS:
            image_ids = []
            spaces = fetch_open_now_for_campus(location, use_cache=False, fill_cache=True)

            for space in spaces:
                if len(space["images"]) > 0:
                    image_ids.append("%i" % space["images"][0]["id"])

            if len(image_ids):
                get_multi_image(None, ",".join(image_ids), True, thumb_width=150, fill_cache=True)
