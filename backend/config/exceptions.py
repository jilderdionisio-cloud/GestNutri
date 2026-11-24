from rest_framework.views import exception_handler as drf_exception_handler


def _messages(value):
    if isinstance(value, dict):
        for child in value.values():
            yield from _messages(child)
    elif isinstance(value, (list, tuple)):
        for child in value:
            yield from _messages(child)
    else:
        yield str(value)


def api_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None or response.status_code != 400:
        return response

    data = response.data
    if not isinstance(data, dict):
        data = {'non_field_errors': list(_messages(data)) or ['Completa este campo.']}
    else:
        data = {str(key): list(_messages(value)) or ['Completa este campo.']
                for key, value in data.items()}

    for field, messages in data.items():
        for index, message in enumerate(messages):
            if message in {'This field is required.', 'This field may not be null.',
                           'Este campo es obligatorio.', 'Este campo no puede ser nulo.'}:
                messages[index] = 'Completa este campo.'
            if field == 'weight_kg' and message in {
                'Formato decimal inválido.', 'Usa una cadena decimal exacta.',
                'A valid number is required.', 'A valid string is required.',
            }:
                messages[index] = 'Escribe el peso con números, por ejemplo 68.5.'
    response.data = data
    return response
