from rest_framework.permissions import BasePermission


class EsSuperUsuario(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_staff
            and request.user.is_superuser
        )