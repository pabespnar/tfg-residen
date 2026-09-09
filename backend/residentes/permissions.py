from rest_framework.permissions import BasePermission


class EsGestorResidentesOAlmacen(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (request.user.rol == 'residentes' or request.user.rol == 'almacen')
        )