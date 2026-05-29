class NotFoundException(Exception):
    pass


class UnauthorizedException(Exception):
    pass


class ConflictException(Exception):

    def __init__(self, message: str):
        self.message = message


class ValidationException(Exception):
    pass