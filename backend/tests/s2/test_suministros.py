from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario
from suministros.models import Categoria, Suministro


class SuministrosTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='almacen@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Almacen',
            dni='87654321B',
            rol='almacen'
        )

        self.usuario_administracion = Usuario.objects.create_user(
            email='administracion@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Administracion',
            dni='11223344C',
            rol='administracion'
        )

        self.categoria = Categoria.objects.create(
            nombre='Alimentacion',
            descripcion='Productos de alimentacion'
        )

        self.suministro = Suministro.objects.create(
            nombre='Arroz',
            detalles='Arroz blanco',
            stock=50,
            unidad='kg',
            stock_minimo=10,
            categoria=self.categoria
        )

        self.suministro_sin_categoria = Suministro.objects.create(
            nombre='Jabon',
            detalles='Jabon de manos',
            stock=20,
            unidad='unidades',
            stock_minimo=5
        )

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_listar_suministros(self):
        url = reverse('suministros')

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['nombre'], 'Arroz')

    def test_listar_suministros_sin_autenticar(self):
        self.client.credentials()

        url = reverse('suministros')

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_crear_categoria_correctamente(self):
        url = reverse('crear_categoria')

        data = {
            'nombre': 'Higiene',
            'descripcion': 'Productos de higiene'
        }

        response = self.client.post(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertEqual(
            Categoria.objects.count(),
            2
        )

        categoria = Categoria.objects.get(
            nombre='Higiene'
        )

        self.assertEqual(
            categoria.descripcion,
            'Productos de higiene'
        )

    def test_crear_categoria_con_nombre_duplicado(self):
        url = reverse('crear_categoria')

        data = {
            'nombre': 'Alimentacion',
            'descripcion': 'Otra descripcion'
        }

        response = self.client.post(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn('nombre', response.data)

    def test_crear_categoria_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('crear_categoria')

        data = {
            'nombre': 'Higiene',
            'descripcion': 'Productos de higiene'
        }

        response = self.client.post(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_listar_categorias_con_suministros(self):
        url = reverse('categorias')

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        self.assertEqual(len(response.data), 2)

        categoria = next(
            categoria
            for categoria in response.data
            if categoria['id'] == self.categoria.id
        )

        self.assertEqual(
            categoria['nombre'],
            'Alimentacion'
        )
        self.assertEqual(
            len(categoria['suministros']),
            1
        )
        self.assertEqual(
            categoria['suministros'][0]['nombre'],
            'Arroz'
        )

    def test_listar_categorias_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('categorias')

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )