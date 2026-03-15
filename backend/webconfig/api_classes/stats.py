from rest_framework import serializers, views, permissions
from rest_framework.response import Response
from django.db import models
from webconfig.models import VisitStat

class StatsSerializer(serializers.Serializer):
    visits_total = serializers.IntegerField()
    conversions_total = serializers.IntegerField()


class StatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        agg = VisitStat.objects.aggregate(visits_total=models.Sum('visits'), conversions_total=models.Sum('conversions'))
        return Response({
            'visits_total': int(agg.get('visits_total') or 0),
            'conversions_total': int(agg.get('conversions_total') or 0),
        })
