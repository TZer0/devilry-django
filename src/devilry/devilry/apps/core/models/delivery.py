from datetime import datetime

from django.utils.formats import date_format
from django.utils.translation import ugettext as _
from django.db import models
from django.db.models import Q, Max
from django.core.exceptions import ValidationError
from django.conf import settings

from deadline import Deadline
from filemeta import FileMeta
from . import AbstractIsAdmin, AbstractIsExaminer, AbstractIsCandidate, Node
import deliverytypes


DEFAULT_DEADLINE_EXPIRED_MESSAGE = _('Your active deadline, {deadline} has expired, and the administrators of {assignment} have configured HARD deadlines. This means that you can not add more deliveries to this assignment before an administrator have extended your deadline.')
DEADLINE_EXPIRED_MESSAGE = getattr(settings, 'DEADLINE_EXPIRED_MESSAGE', DEFAULT_DEADLINE_EXPIRED_MESSAGE)


# TODO: Constraint: Can only be delivered by a person in the assignment group?
#                   Or maybe an administrator?
class Delivery(models.Model, AbstractIsAdmin, AbstractIsCandidate, AbstractIsExaminer):
    """ A class representing a given delivery from an `AssignmentGroup`_.

    .. attribute:: time_of_delivery

        A django.db.models.DateTimeField_ that holds the date and time the
        Delivery was uploaded.

    .. attribute:: deadline

       A django.db.models.ForeignKey_ pointing to the `Deadline`_ for this Delivery.

    .. attribute:: number

        A django.db.models.fields.PositiveIntegerField with the delivery-number
        within this assignment-group. This number is automatically
        incremented within each assignmentgroup, starting from 1. Must be
        unique within the assignment-group. Automatic incrementation is used
        if number is None when calling :meth:`save`.

    .. attribute:: delivered_by

        A django.db.models.ForeignKey_ pointing to the user that uploaded
        the Delivery

    .. attribute:: successful

        A django.db.models.BooleanField_ telling whether or not the Delivery
        was successfully uploaded.

    .. attribute:: after_deadline

        A django.db.models.BooleanField_ telling whether or not the Delivery
        was delived after deadline..

    .. attribute:: filemetas

        A set of :class:`filemetas <devilry.apps.core.models.FileMeta>` for this delivery.

    .. attribute:: feedbacks

       A set of :class:`feedbacks <devilry.apps.core.models.StaticFeedback>` on this delivery.

    .. attribute:: etag

       A DateTimeField containing the etag for this object.
    """
    #DELIVERY_NOT_CORRECTED = 0
    #DELIVERY_CORRECTED = 1

    delivery_type = models.PositiveIntegerField(default=deliverytypes.ELECTRONIC,
                                                verbose_name = "Type of delivery",
                                                help_text='0: Electronic delivery, 1: Non-electronic delivery, 2: Alias delivery. Default: 0.')
    # Fields automatically 
    time_of_delivery = models.DateTimeField(auto_now_add=True,
                                           help_text='Holds the date and time the Delivery was uploaded.')
    deadline = models.ForeignKey(Deadline, related_name='deliveries')
    number = models.PositiveIntegerField(
        help_text='The delivery-number within this assignment-group. This number is automatically '
                    'incremented within each AssignmentGroup, starting from 1. Always '
                    'unique within the assignment-group.')

    # Fields set by user
    successful = models.BooleanField(blank=True, default=False,
                                    help_text='Has the delivery and all its files been uploaded successfully?')
    delivered_by = models.ForeignKey("Candidate", blank=True, null=True,
                                     help_text='The candidate that delivered this delivery. If this is None, the delivery was made by an administrator for a student.')

    # Only used when this is aliasing an earlier delivery, delivery_type == ALIAS
    alias_delivery = models.OneToOneField("Delivery", blank=True, null=True,
                                          help_text='Links to another delivery. Used when delivery_type is Alias.')

    def _delivered_too_late(self):
        """ Compares the deadline and time of delivery.
        If time_of_delivery is greater than the deadline, return True.
        """
        return self.time_of_delivery > self.deadline.deadline
    after_deadline = property(_delivered_too_late)

    class Meta:
        app_label = 'core'
        verbose_name = 'Delivery'
        verbose_name_plural = 'Deliveries'
        ordering = ['-time_of_delivery']
        #unique_together = ('assignment_group', 'number')

    @classmethod
    def q_is_candidate(cls, user_obj):
        """
        Returns a django.models.Q object matching Deliveries where
        the given student is candidate.
        """
        return Q(successful=True) & Q(deadline__assignment_group__candidates__student=user_obj)

    @classmethod
    def q_published(cls, old=True, active=True):
        now = datetime.now()
        q = Q(deadline__assignment_group__parentnode__publishing_time__lt = now)
        if not active:
            q &= ~Q(deadline__assignment_group__parentnode__parentnode__end_time__gte = now)
        if not old:
            q &= ~Q(deadline__assignment_group__parentnode__parentnode__end_time__lt = now)
        return q


    @classmethod
    def q_is_admin(cls, user_obj):
        return Q(successful=True) & \
                Q(Q(deadline__assignment_group__parentnode__admins=user_obj) | \
                  Q(deadline__assignment_group__parentnode__parentnode__admins=user_obj) | \
                  Q(deadline__assignment_group__parentnode__parentnode__parentnode__admins=user_obj) | \
                  Q(deadline__assignment_group__parentnode__parentnode__parentnode__parentnode__pk__in=Node._get_nodepks_where_isadmin(user_obj)))

    @classmethod
    def q_is_examiner(cls, user_obj):
        return Q(successful=True) & Q(deadline__assignment_group__examiners__user=user_obj)

    def add_file(self, filename, iterable_data):
        """ Add a file to the delivery.

        :param filename:
            A filename as defined in :class:`FileMeta`.
        :param iterable_data:
            A iterable yielding data that can be written to file using the
            write() method of a storage backend (byte strings).
        """
        filemeta = FileMeta()
        filemeta.delivery = self
        filemeta.filename = filename
        filemeta.size = 0
        filemeta.save()
        f = FileMeta.deliverystore.write_open(filemeta)
        filemeta.save()
        for data in iterable_data:
            f.write(data)
            filemeta.size += len(data)
        f.close()
        filemeta.save()
        return filemeta

    def _set_number(self):
        m = Delivery.objects.filter(deadline__assignment_group=self.deadline.assignment_group).aggregate(Max('number'))
        self.number = (m['number__max'] or 0) + 1

    def clean(self, *args, **kwargs):
        """Validate the delivery.

        ..raise ValidationError::
            If the ``deadline_handling`` attribute of the assignment is ``1``, and the deadline has expired.
        """
        assignment = self.deadline.assignment_group.parentnode
        if assignment.deadline_handling == 1:
            if self.deadline.deadline < datetime.now():
                raise ValidationError(DEADLINE_EXPIRED_MESSAGE.format(deadline=self.deadline.deadline.isoformat(),
                                                                      assignment=unicode(assignment)))

        super(Delivery, self).clean(*args, **kwargs)

    def save(self, *args, **kwargs):
        """
        Set :attr:`number` automatically to one greater than what is was last and
        add the delivery to the latest deadline (see :meth:`AssignmentGroup.get_active_deadline`).
        """
        if self.successful:
            self._set_number()
        else:
            self.number = 0 # NOTE: Number is 0 until the delivery is successful
        super(Delivery, self).save(*args, **kwargs)

    def __unicode__(self):
        return u'%s - %s (%s)' % (self.deadline.assignment_group, self.number,
                date_format(self.time_of_delivery, "DATETIME_FORMAT"))
