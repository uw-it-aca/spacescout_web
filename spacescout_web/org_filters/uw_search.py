from spacescout_web.org_filters import SearchFilter


class Filter(SearchFilter):
    def url_args(self, args):
        search_args = []
        if self.request.path != u'/':
            request_parts = self.request.path.split('/')
            campus = request_parts[1]
            if len(request_parts) > 2:
                params = request_parts[2].split('|')
            else:
                params = request_parts
            for param in params:
                if param.count(':') == 1 and param.find(':') > -1:
                    key, value = param.split(':')
                elif param.find(':') > -1:
                    parts = param.split(':')
                    key = parts[0]
                    parts = parts[1:]
                    for x in range(0, len(parts)):
                        if x == 0:
                            value = parts[x]
                        else:
                            value = value + ':' + parts[x]
                else:
                    key = param

                if key == 'type':
                    search_args.append({key: value})
                elif key == 'reservable':
                    search_args.append({'extended_info:reservable':
                                        'true'})
                elif key == 'cap':
                    search_args.append({'capacity': int(value)})
                elif key == 'open':
                    search_args.append({'open_at': value})
                elif key == 'close':
                    search_args.append({'open_until': value})
                elif key == 'bld':
                    values = value.split(',')
                    for value in values:
                        value = value.replace(' ', '+')
                        search_args.append({'building_name': value})
                elif key == 'rwb':
                    search_args.append({'extended_info:has_whiteboards':
                                        'true'})
                elif key == 'rol':
                    search_args.append({'extended_info:has_outlets':
                                        'true'})
                elif key == 'rcp':
                    search_args.append({'extended_info:has_computers':
                                        'true'})
                elif key == 'rsc':
                    search_args.append({'extended_info:has_scanner':
                                        'true'})
                elif key == 'rpj':
                    search_args.append({'extended_info:has_projector':
                                        'true'})
                elif key == 'rpr':
                    search_args.append({'extended_info:has_printing':
                                        'true'})
                elif key == 'rds':
                    search_args.append({'extended_info:has_displays':
                                        'true'})
                elif key == 'natl':
                    search_args.append({'extended_info:has_natural_light':
                                        'true'})
                elif key == 'noise':
                    values = value.split(',')
                    for value in values:
                        search_args.append({'extended_info:noise_level':
                                            value})
                elif key == 'food':
                    values = value.split(',')
                    for value in values:
                        search_args.append({'extended_info:food_nearby':
                                            value})
        return search_args
