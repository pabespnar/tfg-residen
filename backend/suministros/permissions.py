from rest_framework.permissions import BasePermission


class EsGestorAlmacen(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.rol == 'almacen'
        )