from rest_framework.permissions import BasePermission


class EsGestorAdministracion(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.rol == 'administracion'
        )

class EsGestorAlmacenOAdministracion(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (request.user.rol == 'administracion' or request.user.rol == 'almacen')
        )