from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Centro
from .serializers import CentroSerializer
from .permissions import EsSuperUsuario


class CentroView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'PATCH':
            return [IsAuthenticated(), EsSuperUsuario()]

        return [IsAuthenticated()]

    def get(self, request):
        centro = Centro.get_solo()
        serializer = CentroSerializer(centro)
        return Response(serializer.data)

    def patch(self, request):
        centro = Centro.get_solo()

        serializer = CentroSerializer(
            centro,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )