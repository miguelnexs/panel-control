from rest_framework import serializers, generics, views, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from webconfig.models import Template
from users.models import UserProfile
from django.core.files.base import ContentFile
import time

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'name', 'description', 'slug', 'image', 'zip_file', 'demo_url', 'color', 'tags', 'is_personal', 'owner', 'page_content']


class TemplateListView(generics.ListAPIView):
    queryset = Template.objects.filter(is_active=True)
    serializer_class = TemplateSerializer
    permission_classes = [permissions.AllowAny]


class TemplateAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_queryset(self):
        return Template.objects.all()
    def update(self, request, *args, **kwargs):
        try:
            profile = UserProfile.objects.filter(user=request.user).first()
            role = getattr(profile, 'role', 'employee')
        except Exception:
            role = 'employee'
        if role not in ('super_admin', 'admin'):
            return Response({'detail': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)


class TemplateCloneView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            original = Template.objects.get(pk=pk)
        except Template.DoesNotExist:
            return Response({'detail': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Generate unique slug
            slug_base = original.slug or 'template'
            new_slug = f"{slug_base}-copy-{int(time.time())}"
            
            new_template = Template(
                name=f"{original.name} (Copy)",
                description=original.description,
                slug=new_slug,
                demo_url=original.demo_url,
                color=original.color,
                tags=original.tags,
                is_personal=True,
                owner=request.user,
                page_content=original.page_content,
                is_active=True
            )
            
            # Copy files if they exist
            if original.image:
                try:
                    f_img = original.image.open()
                    new_template.image.save(original.image.name.split('/')[-1], ContentFile(f_img.read()), save=False)
                    f_img.close()
                except Exception as e:
                    print(f"Error copying image: {e}")

            if original.zip_file:
                try:
                    f_zip = original.zip_file.open()
                    new_template.zip_file.save(original.zip_file.name.split('/')[-1], ContentFile(f_zip.read()), save=False)
                    f_zip.close()
                except Exception as e:
                    print(f"Error copying zip: {e}")

            new_template.save()
            return Response(TemplateSerializer(new_template).data)
        except Exception as e:
            print(f"Error cloning template: {e}")
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MyTemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_queryset(self):
        return Template.objects.filter(owner=self.request.user, is_personal=True).order_by('-created_at')
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, is_personal=True, is_active=True)


class MyTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_queryset(self):
        return Template.objects.filter(owner=self.request.user, is_personal=True)
