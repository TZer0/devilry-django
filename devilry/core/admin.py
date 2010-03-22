from models import (Node, Subject, Period, Assignment,
        AssignmentGroup, Delivery, FileMeta)
from django.contrib import admin
from django.db.models import Q
from django.db import models
from django import forms



class BaseNodeAdmin(admin.ModelAdmin):
    list_display = ('short_name', 'long_name', 'get_path')
    search_fields = ['short_name', 'long_name']


class NodeAdmin(BaseNodeAdmin):
    pass

class SubjectAdmin(BaseNodeAdmin):
    pass

class PeriodAdmin(BaseNodeAdmin):
    list_display = ['parentnode', 'short_name', 'start_time', 'end_time', 'admins_unicode']
    search_fields = ['short_name', 'long_name', 'parentnode__short_name']
    list_filter = ['start_time', 'end_time']
    ordering = ['parentnode']


class FileMetaInline(admin.TabularInline):
    model = FileMeta
    extra = 1


class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['__unicode__', 'id']
    inlines = [FileMetaInline]

class AssignmentGroupAdmin(BaseNodeAdmin):
    list_display = ['parentnode', 'get_students', 'get_examiners']
    search_fields = [
            'parentnode__short_name', 'parentnode__parentnode__short_name', 'parentnode__parentnode__parentnode__short_name']
    ordering = ['parentnode']


admin.site.register(Node, NodeAdmin)
admin.site.register(Subject, SubjectAdmin)
admin.site.register(Period, PeriodAdmin)
admin.site.register(Assignment)
admin.site.register(AssignmentGroup, AssignmentGroupAdmin)
admin.site.register(Delivery, DeliveryAdmin)
