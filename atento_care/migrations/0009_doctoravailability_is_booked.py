# Generated by Django 4.1.4 on 2023-09-15 11:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('atento_care', '0008_delete_appointmentstatus_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='doctoravailability',
            name='is_booked',
            field=models.BooleanField(default=False),
        ),
    ]
