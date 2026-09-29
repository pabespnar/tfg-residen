from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario
from residentes.models import Residente, Genero
from modulos.models import Modulo, Habitacion
from suministros.models import (
    Suministro,
    Pack,
    ContenidoPack,
    EntregaPack
)


class PacksTests(APITestCase):

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

        self.modulo = Modulo.objects.create(
            nombre='Modulo 1',
            descripcion='Descripcion del modulo',
            num_habitaciones_max=5
        )

        self.habitacion = Habitacion.objects.create(
            nombre='Habitacion 1',
            info='Informacion de la habitacion',
            capacidad=2,
            f_alta='2026-09-10',
            modulo=self.modulo
        )

        self.genero = Genero.MASCULINO

        self.residente = Residente.objects.create(
            nombre='Juan',
            apellido='Perez',
            telefono='600123456',
            email='juan@test.com',
            f_nacimiento='1990-01-01',
            f_alta='2026-09-10',
            pais='España',
            dni_nie='12345678X',
            activo=True,
            habitacion=self.habitacion,
            genero=self.genero
        )

        self.suministro = Suministro.objects.create(
            nombre='Pañales',
            detalles='Pañales de prueba',
            stock=20,
            unidad='paquetes',
            stock_minimo=5
        )

        self.pack = Pack.objects.create(
            nombre='Pack Higiene',
            descripcion='Pack de higiene personal'
        )

        self.contenido = ContenidoPack.objects.create(
            pack=self.pack,
            suministro=self.suministro,
            cantidad=2
        )

        refresh = RefreshToken.for_user(self.usuario)

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_listar_packs(self):
        url = reverse('packs')

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]['nombre'],
            'Pack Higiene'
        )

    def test_listar_packs_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('packs')

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_crear_pack_correctamente(self):
        url = reverse('crear_pack')

        data = {
            'nombre': 'Pack Alimentacion',
            'descripcion': 'Pack de alimentacion'
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
        self.assertEqual(Pack.objects.count(), 2)

        pack = Pack.objects.get(
            nombre='Pack Alimentacion'
        )

        self.assertEqual(
            pack.descripcion,
            'Pack de alimentacion'
        )

    def test_crear_pack_con_nombre_duplicado(self):
        url = reverse('crear_pack')

        data = {
            'nombre': 'Pack Higiene',
            'descripcion': 'Otro pack'
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

    def test_crear_pack_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('crear_pack')

        data = {
            'nombre': 'Pack Alimentacion',
            'descripcion': 'Pack de alimentacion'
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

    def test_crear_contenido_pack_correctamente(self):
        url = reverse('crear_contenido_pack')

        data = {
            'pack': self.pack.id,
            'suministro': self.suministro.id,
            'cantidad': 3
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
            ContenidoPack.objects.count(),
            2
        )

        contenido = ContenidoPack.objects.get(
            pack=self.pack,
            suministro=self.suministro,
            cantidad=3
        )

        self.assertIsNotNone(contenido)

    def test_crear_contenido_pack_con_cantidad_invalida(self):
        url = reverse('crear_contenido_pack')

        data = {
            'pack': self.pack.id,
            'suministro': self.suministro.id,
            'cantidad': 0
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

    def test_crear_contenido_pack_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('crear_contenido_pack')

        data = {
            'pack': self.pack.id,
            'suministro': self.suministro.id,
            'cantidad': 3
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

    def test_entregar_pack_correctamente(self):
        url = reverse(
            'crear_entrega_pack',
            kwargs={'id': self.pack.id}
        )

        data = {
            'residentes': [self.residente.id]
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
            EntregaPack.objects.count(),
            1
        )

        entrega = EntregaPack.objects.first()

        self.assertEqual(
            entrega.pack,
            self.pack
        )
        self.assertEqual(
            entrega.residente,
            self.residente
        )

    def test_entregar_pack_descuenta_stock(self):
        url = reverse(
            'crear_entrega_pack',
            kwargs={'id': self.pack.id}
        )

        data = {
            'residentes': [self.residente.id]
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

        self.suministro.refresh_from_db()

        self.assertEqual(
            self.suministro.stock,
            18
        )

    def test_entregar_pack_a_varios_residentes(self):
        habitacion_2 = Habitacion.objects.create(
            nombre='Habitacion 2',
            info='Otra habitacion',
            capacidad=2,
            f_alta='2026-09-10',
            modulo=self.modulo
        )

        residente_2 = Residente.objects.create(
            nombre='Maria',
            apellido='Gomez',
            f_nacimiento='1995-05-10',
            f_alta='2026-09-10',
            pais='España',
            dni_nie='87654321Y',
            activo=True,
            habitacion=habitacion_2,
            genero=self.genero
        )

        url = reverse(
            'crear_entrega_pack',
            kwargs={'id': self.pack.id}
        )

        data = {
            'residentes': [
                self.residente.id,
                residente_2.id
            ]
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
            EntregaPack.objects.count(),
            2
        )

        self.suministro.refresh_from_db()

        self.assertEqual(
            self.suministro.stock,
            16
        )

    def test_entregar_pack_sin_residentes(self):
        url = reverse(
            'crear_entrega_pack',
            kwargs={'id': self.pack.id}
        )

        response = self.client.post(
            url,
            {'residentes': []},
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'error',
            response.data
        )

    def test_entregar_pack_sin_suministros(self):
        pack_vacio = Pack.objects.create(
            nombre='Pack Vacio',
            descripcion='Pack sin suministros'
        )

        url = reverse(
            'crear_entrega_pack',
            kwargs={'id': pack_vacio.id}
        )

        data = {
            'residentes': [self.residente.id]
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
        self.assertIn(
            'error',
            response.data
        )

    def test_entregar_pack_sin_stock_suficiente(self):
        self.suministro.stock = 1
        self.suministro.save()

        url = reverse(
            'crear_entrega_pack',
            kwargs={'id': self.pack.id}
        )

        data = {
            'residentes': [self.residente.id]
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

        self.assertEqual(
            EntregaPack.objects.count(),
            0
        )

        self.suministro.refresh_from_db()

        self.assertEqual(
            self.suministro.stock,
            1
        )

    def test_entregar_pack_a_residente_inactivo(self):
        self.residente.activo = False
        self.residente.habitacion = None
        self.residente.save()

        url = reverse(
            'crear_entrega_pack',
            kwargs={'id': self.pack.id}
        )

        data = {
            'residentes': [self.residente.id]
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

        self.assertEqual(
            EntregaPack.objects.count(),
            0
        )

    def test_entregar_pack_ya_entregado_al_residente(self):
        EntregaPack.objects.create(
            pack=self.pack,
            residente=self.residente
        )

        url = reverse(
            'crear_entrega_pack',
            kwargs={'id': self.pack.id}
        )

        data = {
            'residentes': [self.residente.id]
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

        self.assertEqual(
            EntregaPack.objects.count(),
            1
        )

    def test_entregar_pack_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'crear_entrega_pack',
            kwargs={'id': self.pack.id}
        )

        data = {
            'residentes': [self.residente.id]
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

    def test_eliminar_pack_correctamente(self):
        pack = Pack.objects.create(
            nombre='Pack Para Eliminar',
            descripcion='Pack de prueba'
        )

        url = reverse(
            'eliminar_pack',
            kwargs={'id': pack.id}
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertFalse(
            Pack.objects.filter(id=pack.id).exists()
        )

    def test_eliminar_pack_ya_asignado(self):
        EntregaPack.objects.create(
            pack=self.pack,
            residente=self.residente
        )

        url = reverse(
            'eliminar_pack',
            kwargs={'id': self.pack.id}
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertTrue(
            Pack.objects.filter(id=self.pack.id).exists()
        )

    def test_eliminar_pack_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'eliminar_pack',
            kwargs={'id': self.pack.id}
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )