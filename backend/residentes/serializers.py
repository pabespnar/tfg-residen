from rest_framework import serializers
from django.utils import timezone

from .models import Residente


class ResidenteSerializer(serializers.ModelSerializer):


    habitacion_nombre = serializers.CharField(
        source='habitacion.nombre',
        read_only=True
    )

    habitacion_modulo_nombre = serializers.CharField(
        source='habitacion.modulo.nombre',
        read_only=True
    )

    pack_recibido = serializers.SerializerMethodField()
    packs_recibidos = serializers.SerializerMethodField()

    class Meta:
        model = Residente
        fields = [
            'id',
            'nombre',
            'apellido',
            'telefono',
            'email',
            'f_nacimiento',
            'f_alta',
            'f_baja',
            'info',
            'pais',
            'dni_nie',
            'activo',
            'habitacion',
            'habitacion_nombre',
            'habitacion_modulo_nombre',
            'foto',
            'genero',
            'pack_recibido',
            'packs_recibidos'
        ]
        read_only_fields = [
            'id',
            'habitacion_nombre',
            'habitacion_modulo_nombre',
            'f_alta'
        ]

    def validate_nombre(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )

        return value

    def validate_apellido(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "El apellido no puede estar vacío."
            )

        return value

    def validate_telefono(self, value):

        if value and not value.strip():
            raise serializers.ValidationError(
                "El teléfono no puede estar formado únicamente por espacios."
            )

        if value and (not value.isdigit() or len(value) != 9):
            raise serializers.ValidationError(
                "El teléfono debe tener 9 dígitos."
            )

        return value

    def validate_info(self, value):

        if value and not value.strip():
            raise serializers.ValidationError(
                "La información no puede estar formada únicamente por espacios."
            )

        if value and len(value) > 200:
            raise serializers.ValidationError(
                "La información no puede superar los 200 caracteres."
            )

        return value

    def validate_pais(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "El país no puede estar vacío."
            )

        return value

    def validate_dni_nie(self, value):
        valor = value.strip().upper()

        if not valor:
            raise serializers.ValidationError(
                "El DNI/NIE no puede estar vacío."
            )

        if len(valor) != 9:
            raise serializers.ValidationError(
                "El DNI/NIE debe tener 9 caracteres."
            )

        es_dni = valor[:-1].isdigit() and valor[-1].isalpha()
        es_nie = valor[0] in "XYZ" and valor[1:-1].isdigit() and valor[-1].isalpha()

        if not (es_dni or es_nie):
            raise serializers.ValidationError(
                "El DNI/NIE debe tener el formato de un DNI (8 dígitos y una letra) "
                "o de un NIE (empieza por X, Y o Z, 7 dígitos y una letra)."
            )

        return valor
    
    def validate_f_nacimiento(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError(
                "La fecha de nacimiento no puede ser una fecha futura."
            )

        return value

    def validate(self, data):

        activo = data.get(
            'activo',
            getattr(self.instance, 'activo', True)
        )

        habitacion = data.get(
            'habitacion',
            getattr(self.instance, 'habitacion', None)
        )

        if activo and habitacion is None:
            raise serializers.ValidationError({
                'habitacion':
                    'Un residente activo debe estar asociado a una habitación.'
            })

        if not activo and habitacion is not None:
            raise serializers.ValidationError({
                'habitacion':
                    'Un residente inactivo no puede estar asociado a una habitación.'
            })

        if habitacion is not None:

            residentes_habitacion = habitacion.residentes.all()

            if self.instance is not None:
                residentes_habitacion = residentes_habitacion.exclude(
                    pk=self.instance.pk
                )

            if residentes_habitacion.count() >= habitacion.capacidad:
                raise serializers.ValidationError({
                    'habitacion':
                        'La habitación ha alcanzado su capacidad máxima.'
                })
      

        return data

    def validate_foto(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "La imagen no puede superar los 5 MB."
            )

        if value.content_type not in [
            'image/jpeg',
            'image/png',
            'image/webp',
        ]:
            raise serializers.ValidationError(
                "Solo se permiten imágenes JPG, PNG o WEBP."
            )

        return value

    def get_pack_recibido(self, residente):

        pack_id = self.context.get('pack_id')

        if not pack_id:
            return False

        return residente.entregapack_set.filter(
            pack_id=pack_id
        ).exists()


    def get_packs_recibidos(self, residente):

        entregas = residente.entregapack_set.select_related(
            'pack'
        ).order_by('-fecha_entrega')

        return [
            {
                'id': entrega.pack.id,
                'nombre': entrega.pack.nombre,
                'fecha_entrega': entrega.fecha_entrega
            }
            for entrega in entregas
        ]