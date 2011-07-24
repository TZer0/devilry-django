from django import template
from django.utils.safestring import mark_safe
from ..modelintegration import (restfulcls_to_extjsmodel, get_extjs_modelname,
                                restfulcls_to_extjscomboboxmodel)
from ..storeintegration import (restfulcls_to_extjsstore, get_extjs_storeid)
from ..formintegration import (restfulcls_to_extjsformitems,
                               restfulcls_to_foreignkeylist)

register = template.Library()


@register.filter
def extjs_model(restfulcls, args=None):
    """
    Create an extjs model from the given restful class.
    Uses :func:`~devilry.apps.extjshelpers.modelintegration.restfulcls_to_extjsmodel`.

    :param restfulcls: Forwarded directly to :func:`~devilry.apps.extjshelpers.modelintegration.restfulcls_to_extjsmodel`.
    :param args:
        A string containing the arguments for :func:`~devilry.apps.extjshelpers.modelintegration.restfulcls_to_extjsmodel`.
        ``args`` is split on ``";"``.
        The first item in the resulting tuple
        is split on ``","`` and forwarded as ``result_fieldgroups``.
        If ``args`` is empty, ``result_fieldgroups`` will be an empty list.
        The second item in the resulting tuple is forwarded as ``modelnamesuffix``.
        If ``args`` does not contain ``";"``, this ``modelnamesuffix`` will be
        an empty string.
    """
    result_fieldgroups = []
    modelnamesuffix = ''

    if args:
        args = args.split(';', 1)
        result_fieldgroups = args[0].split(',')
        if len(args) > 1:
            modelnamesuffix = args[1]
    js = restfulcls_to_extjsmodel(restfulcls, result_fieldgroups)
    return mark_safe(js)

@register.filter
def extjs_combobox_model(restfulcls, modelnamesuffix=''):
    """
    Wrapper for :func:`~devilry.apps.extjshelpers.modelintegration.restfulcls_to_extjscomboboxmodel`.
    """
    js = restfulcls_to_extjscomboboxmodel(restfulcls, modelnamesuffix)
    return mark_safe(js)

@register.filter
def extjs_store(restfulcls, storeidsuffix=''):
    """
    Create an extjs store from the given restful class.
    Uses :func:`~devilry.apps.extjshelpers.storeintegration.restfulcls_to_extjsstore`.

    :param storeidsuffix: Forwarded directly to :func:`~devilry.apps.extjshelpers.storeintegration.restfulcls_to_extjsstore`.
    """
    js = restfulcls_to_extjsstore(restfulcls, storeidsuffix=storeidsuffix)
    return mark_safe(js)

@register.filter
def extjs_form_items(restfulcls):
    """
    Wrapper for
    :func:`~devilry.apps.extjshelpers.formintegration.restfulcls_to_extjsformitems`.
    """
    js = restfulcls_to_extjsformitems(restfulcls)
    return mark_safe(js)

@register.filter
def extjs_foreignkeys(restfulcls):
    """
    Wrapper for
    :func:`~devilry.apps.extjshelpers.formintegration.restfulcls_to_foreignkeylist`.
    """
    js = restfulcls_to_foreignkeylist(restfulcls)
    return mark_safe(js)

@register.filter
def extjs_modelname(restfulcls, modelnamesuffix=''):
    """
    Get the name of the extjs model generated by
    :func:`~devilry.extjshelpers.templatetags.extjs.extjs_model` using the same
    ``restfulcls``.

    Uses :func:`~devilry.apps.extjshelpers.modelintegration.get_extjs_modelname`.
    """
    js = get_extjs_modelname(restfulcls, modelnamesuffix)
    return mark_safe("'{0}'".format(js))

@register.filter
def extjs_storeid(restfulcls, storeidsuffix=''):
    """
    Get the id of the extjs store generated by
    :func:`~devilry.extjshelpers.templatetags.extjs.extjs_store` using the same
    ``restfulcls``.

    Uses :func:`~devilry.apps.extjshelpers.storeintegration.get_extjs_storeid`.

    :param storeidsuffix:
        Forwarded to  :func:`~devilry.apps.extjshelpers.storeintegration.get_extjs_storeid`.
    """
    js = get_extjs_storeid(restfulcls, storeidsuffix)
    return mark_safe("'{0}'".format(js))
