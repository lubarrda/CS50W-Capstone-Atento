# Generated by Django 4.1.4 on 2023-07-04 10:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('atento_care', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scheduledappointment',
            name='status',
            field=models.CharField(choices=[('REQUESTED', 'Requested'), ('ACCEPTED', 'Accepted'), ('REJECTED', 'Rejected'), ('CANCELLED', 'Cancelled'), ('COMPLETED', 'Completed')], default='REQUESTED', max_length=10),
        ),
    ]
