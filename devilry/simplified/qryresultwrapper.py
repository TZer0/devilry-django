from django.db.models import Q

from utils import modelinstance_to_dict


class QryResultWrapper(object):
    """ Wrapper around a django QuerySet.

    .. attribute:: resultfields

        The underlying django queryset provides access to far more data
        than what we usually require. This list contains the fields provided
        when methods in this class converts the model instances
        in the wrapped django queryset into a dict.

    .. attribute:: searchfields

        The fields that was search when generating this result.

    .. attribute:: _insecure_django_qryset

        The django queryset which this object wraps to provide security.
        Should **not** be used unless the public methods of this class
        fails to provide the required functionality. Any use of _insecure_django_qryset
        is considered a security risc.
    """
    def __init__(self, resultfields, searchfields, django_qryset):
        self.resultfields = resultfields
        self.searchfields = searchfields
        self._insecure_django_qryset = django_qryset
        self._cached_valuesqryset = None

    def __getitem__(self, index):
        """ Get the result at the given ``index`` as a dict. """
        return modelinstance_to_dict(self._insecure_django_qryset[index],
                                     self.resultfields)

    def __len__(self):
        """ Shortcut for ``len(_insecure_django_qryset)``. """
        return len(self._insecure_django_qryset)

    def count(self):
        """ Shortcut for ``_insecure_django_qryset.count()``. """
        return len(self._insecure_django_qryset)
        return self._insecure_django_qryset.count()

    def _valuesQryset(self):
        if not self._cached_valuesqryset:
            self._cached_valuesqryset = self._insecure_django_qryset.values(*self.resultfields)
        return self._cached_valuesqryset

    def __iter__(self):
        """ Iterate over all items in the result, yielding a dict
        containing the result data for each item. """
        for item in self._valuesQryset():
            yield item

    def _create_q(self, query):
        """ Create a ``django.db.models.Q`` object from the given
        query. The resulting Q matches data in any field in
        :attr:`resultfields` """
        filterargs = None
        for field in self.searchfields:
            q = Q(**{"%s__icontains" % field: query})
            if filterargs:
                filterargs |= q
            else:
                filterargs = q
        return filterargs

    def _limit_queryset(self, limit, start):
        self._insecure_django_qryset = self._insecure_django_qryset[start:start+limit]

    def _filter_orderby(self, orderby):
        """
        Returns a list of all resultfields in ``orderby`` which is in ``resultfields``
        (including those prefixed with a character, such as '-')
        """
        def filter_test(orderfield):
            return orderfield in self.resultfields or \
                    (orderfield[1:] in self.resultfields and orderfield[0] == '-')
        return filter(filter_test, orderby)

    def _order_queryset(self, orderby):
        orderby_filtered = self._filter_orderby(orderby)
        self._insecure_django_qryset = self._insecure_django_qryset.order_by(*orderby_filtered)

    def _standard_operations(self, query='', limit=50, start=0, orderby=[]):
        if query:
            q = self._create_q(query)
            self._insecure_django_qryset = self._insecure_django_qryset.filter(q)
        self._insecure_django_qryset = self._insecure_django_qryset.distinct()
        if orderby:
            self._order_queryset(orderby)
        self._limit_queryset(limit, start)
