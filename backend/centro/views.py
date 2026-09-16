from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Centro
from .serializers import CentroSerializer


class CentroView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        centro = Centro.get_solo()
        serializer = CentroSerializer(centro)
        return Response(serializer.data)