import datetime
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Enrollment, VideoProgress
from .serializers import EnrollmentSerializer, VideoProgressSerializer
from trainers.models import Note, Video, LiveSession
from assignments.models import Assignment


class EnrollmentViewSet(viewsets.ModelViewSet):
    """Register / Enroll in courses / Track progress."""
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["course", "is_completed"]

    def get_queryset(self):
        user = self.request.user
        qs = Enrollment.objects.all().order_by("-enrolled_at")
        if user.role == "student":
            return qs.filter(student=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=["get"], url_path="calendar")
    def get_calendar(self, request):
        user = request.user
        course_id = request.query_params.get("course_id")

        if user.role != "student" and not course_id:
            from courses.models import Course
            first_course = Course.objects.first()
            if first_course:
                course_id = first_course.id
            else:
                return Response({
                    "course_name": None,
                    "duration_weeks": 0,
                    "days": []
                })

        if course_id:
            from courses.models import Course
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return Response({"detail": "Course not found."}, status=404)
            # Use a mock reference date or course created date
            start_date = timezone.localtime(timezone.now()).date() - datetime.timedelta(days=2)
            enrollment = None
        else:
            # Get latest active enrollment
            enrollment = Enrollment.objects.filter(student=user, is_completed=False).order_by("-enrolled_at").first()
            if not enrollment:
                # Fallback to any enrollment if none is in progress
                enrollment = Enrollment.objects.filter(student=user).order_by("-enrolled_at").first()

            if not enrollment:
                return Response({
                    "course_name": None,
                    "duration_weeks": 0,
                    "days": []
                })

            course = enrollment.course
            start_date = enrollment.enrolled_at.date()
        duration_weeks = course.duration_weeks
        total_days = duration_weeks * 7
        end_date = start_date + datetime.timedelta(days=total_days - 1)

        # Retrieve course classes content (videos, notes, live sessions, assignments)
        videos = list(course.videos.all())
        notes = list(course.notes.all())
        live_sessions = list(course.live_sessions.all().order_by("scheduled_at"))
        assignments = list(course.assignments.all().order_by("due_date"))

        days_list = []
        today = timezone.localtime(timezone.now()).date()

        for d in range(total_days):
            day_date = start_date + datetime.timedelta(days=d)
            day_name = day_date.strftime("%a") # e.g. Mon, Tue
            is_today = (day_date == today)

            classes = []
            
            # 1. Add Videos scheduled for this date
            for video in [v for v in videos if v.date == day_date]:
                watched = VideoProgress.objects.filter(enrollment=enrollment, video=video, watched=True).exists() if enrollment else False
                classes.append({
                    "id": f"vid_{video.id}",
                    "title": video.title,
                    "type": "Recorded",
                    "time": "10:00 AM - 11:30 AM",
                    "watched": watched,
                    "video_id": video.id,
                    "url": video.url or (video.file.url if video.file else "https://www.w3schools.com/html/mov_bbb.mp4")
                })

            # 2. Add Notes scheduled for this date
            for note in [n for n in notes if n.date == day_date]:
                classes.append({
                    "id": f"note_{note.id}",
                    "title": note.title,
                    "type": "Reading",
                    "time": "All Day Reference",
                    "url": note.file.url if note.file else ""
                })

            # 3. Add Live Sessions scheduled for this date
            for ls in [ls for ls in live_sessions if ls.scheduled_at.date() == day_date]:
                classes.append({
                    "id": f"live_{ls.id}",
                    "title": ls.title,
                    "type": "Live",
                    "time": ls.scheduled_at.strftime("%I:%M %p"),
                    "url": ls.meeting_link
                })

            # 4. Add Assignments scheduled for this date
            for a in [a for a in assignments if a.date == day_date or (a.date is None and a.due_date.date() == day_date)]:
                classes.append({
                    "id": f"assign_{a.id}",
                    "title": a.title,
                    "type": "Assignment",
                    "time": "Due: " + a.due_date.strftime("%I:%M %p"),
                    "url": "/assignments"
                })

            # Fallback block: if weekend and no tasks, add Weekend Practice
            if day_date.weekday() >= 5 and len(classes) == 0:
                classes.append({
                    "id": f"practice_{d}",
                    "title": "Weekend Practice Lab & Coding Review",
                    "type": "Practice",
                    "time": "All Day",
                    "url": ""
                })

            days_list.append({
                "offset": d,
                "date": day_date.strftime("%Y-%m-%d"),
                "date_num": day_date.day,
                "day_name": day_name,
                "is_today": is_today,
                "classes": classes
            })

        return Response({
            "enrollment_id": enrollment.id,
            "course_id": course.id,
            "course_name": course.name,
            "duration_weeks": duration_weeks,
            "is_paused": enrollment.is_paused,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "days": days_list
        })

    @action(detail=True, methods=["get"], url_path="certificate")
    def certificate(self, request, pk=None):
        enrollment = self.get_object()
        user = request.user

        # Allow certificate for 100% or completed enrollments (or if requested by user)
        import hashlib
        cert_id = f"CERT-{enrollment.id:04d}-{enrollment.student.id:04d}"
        verify_hash = hashlib.sha256(cert_id.encode()).hexdigest()[:12].upper()
        
        student_name = f"{user.first_name} {user.last_name}".strip() or user.username
        trainer = enrollment.course.trainer
        trainer_name = f"{trainer.first_name} {trainer.last_name}".strip() if trainer and (trainer.first_name or trainer.last_name) else (trainer.username if trainer else "Enterprise LMS Master Instructor")
        
        data = {
            "certificate_id": cert_id,
            "verification_code": verify_hash,
            "student_name": student_name,
            "student_email": user.email,
            "course_name": enrollment.course.name,
            "category": enrollment.course.category.name if enrollment.course.category else "Computer Science & Engineering",
            "trainer_name": trainer_name,
            "issued_date": timezone.now().strftime("%B %d, %Y"),
            "progress_percent": enrollment.progress_percent if enrollment.progress_percent > 0 else 100,
            "issue_authority": "Enterprise LMS Global Certification Board",
        }
        return Response(data)



class VideoProgressViewSet(viewsets.ModelViewSet):
    """Watch videos -> mark progress."""
    serializer_class = VideoProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["enrollment", "watched"]

    def get_queryset(self):
        user = self.request.user
        qs = VideoProgress.objects.all()
        if user.role == "student":
            return qs.filter(enrollment__student=user)
        return qs

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.watched and not instance.watched_at:
            instance.watched_at = timezone.now()
            instance.save()
        # simple progress recompute
        enrollment = instance.enrollment
        total = enrollment.video_progress.count()
        done = enrollment.video_progress.filter(watched=True).count()
        if total:
            enrollment.progress_percent = int(done / total * 100)
            enrollment.is_completed = enrollment.progress_percent >= 100
            enrollment.save()
