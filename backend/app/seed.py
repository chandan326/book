from app.database import SessionLocal, engine, Base
from app.config import settings
from app.models.user import User
from app.models.book import Book, Part, Chapter, Section
from app.models.publisher import Publisher
from app.services.auth_service import get_password_hash
from app.services.maps_service import DEFAULT_PUBLISHERS

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Super Admin User
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash("Admin12345!"),
                full_name="Chandan Rai (Super Admin)",
                role="Super Admin",
                bio="Platform Founder & Executive Editor.",
                country="India",
                writing_preferences="Non-fiction, Technology & Science"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        # 2. Seed Default Publishers
        for pub in DEFAULT_PUBLISHERS:
            existing_pub = db.query(Publisher).filter(Publisher.id == pub["id"]).first()
            if not existing_pub:
                p = Publisher(
                    id=pub["id"],
                    name=pub["name"],
                    publisher_type=pub["publisher_type"],
                    address=pub["address"],
                    city=pub["city"],
                    country=pub["country"],
                    latitude=pub["latitude"],
                    longitude=pub["longitude"],
                    website=pub["website"],
                    phone=pub["phone"],
                    rating=pub["rating"],
                    description=pub["description"],
                    is_verified=pub["is_verified"]
                )
                db.add(p)
        db.commit()

        # 3. Demo Books Collection Data
        demo_books_data = [
            {
                "title": "The AI Author's Blueprint",
                "subtitle": "Mastering Intelligent Manuscript Creation & Global Publishing",
                "genre": "Technology & Publishing",
                "language": "English",
                "target_audience": "Authors, Publishers & Creators",
                "writing_style": "Authoritative & Engaging",
                "description": "A comprehensive, startup-grade handbook on leveraging artificial intelligence for writing, editing, formatting, and distributing world-class literature.",
                "status": "Public",
                "views_count": 104500,
                "downloads_count": 1240,
                "formatting_preset": "Non-fiction",
                "chapters": [
                    {
                        "title": "Chapter 1: The New Era of Intelligent Writing",
                        "summary": "Understanding the synergy between artificial intelligence and human craftsmanship.",
                        "sections": [
                            {
                                "title": "Section 1.1: The Architect vs. The Engine",
                                "content": "Writing a book has historically been a lonely, grueling endeavor spanning years. Today, intelligent editing engines act as co-pilots, auditing structure, verifying factual claims, and polishing prose in real time while preserving the author's authentic voice.\n\nThe key to successful AI-assisted publishing lies in maintaining strict author control. AI suggestions must remain reversible diffs rather than silent overwrites."
                            },
                            {
                                "title": "Section 1.2: Crafting Prompt Engineering for Authors",
                                "content": "To extract true literary brilliance from large language models, an author must learn to prompt with context, style guidelines, and tone directives. Setting parameters for vocabulary, rhythm, and pacing ensures that AI output seamlessly blends with human creativity."
                            }
                        ]
                    },
                    {
                        "title": "Chapter 2: Structural Integrity & Reversible Diffs",
                        "summary": "How to maintain manuscript architecture and version control across multiple edits.",
                        "sections": [
                            {
                                "title": "Section 2.1: Designing Modular Books",
                                "content": "A true manuscript is not a single giant text block. It is a hierarchical tree composed of Parts, Chapters, Sections, and Subsections. Each node carries specific metadata, readability scores, and visual placement flags."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Mastering Modern Web Architecture",
                "subtitle": "Building Ultra-Fast, Scalable 60fps Web Applications",
                "genre": "Software Engineering",
                "language": "English",
                "target_audience": "Developers, Architects & Tech Leaders",
                "writing_style": "Technical & Practical",
                "description": "Discover production-grade techniques for building blazing-fast web applications using modern CSS layout containment, GPU hardware acceleration, and reactive state optimization.",
                "status": "Public",
                "views_count": 89400,
                "downloads_count": 980,
                "formatting_preset": "Technical",
                "chapters": [
                    {
                        "title": "Chapter 1: Foundations of High Performance",
                        "summary": "Eliminating layout reflows, repaints, and frame drops in complex web applications.",
                        "sections": [
                            {
                                "title": "Section 1.1: Understanding the Browser Rendering Pipeline",
                                "content": "When a web page renders, the browser executes JS, calculates styles, computes layout geometry, paints pixels into layers, and composites those layers onto the screen. Avoiding costly layout recalculations is essential for smooth 60fps and 120fps UI performance."
                            },
                            {
                                "title": "Section 1.2: CSS Layout Containment & GPU Layers",
                                "content": "By applying properties like contain: layout style and transform: translateZ(0), developers inform browser rendering engines that changes inside a component do not affect surrounding layouts. This dramatically accelerates interface response times."
                            }
                        ]
                    },
                    {
                        "title": "Chapter 2: State Management & Debouncing",
                        "summary": "Optimizing React re-renders and handling user interaction events gracefully.",
                        "sections": [
                            {
                                "title": "Section 2.1: Preventing Unnecessary Component Re-renders",
                                "content": "React components re-render whenever state or prop references change. Wrapping pure presentation components with React.memo and debouncing event listeners prevents micro-stutters during heavy user interactions."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "The Art of Deep Focus & Creativity",
                "subtitle": "Unlocking Uninterrupted Flow States in a Distracted World",
                "genre": "Self-Improvement & Psychology",
                "language": "English",
                "target_audience": "Thinkers, Writers & Entrepreneurs",
                "writing_style": "Inspiring & Insightful",
                "description": "A deep dive into cognitive science, distraction-free reading environments, and the psychology of creative productivity for modern knowledge workers.",
                "status": "Public",
                "views_count": 67200,
                "downloads_count": 750,
                "formatting_preset": "Non-fiction",
                "chapters": [
                    {
                        "title": "Chapter 1: The Psychology of Deep Work",
                        "summary": "Why focused attention is the superpower of the 21st century.",
                        "sections": [
                            {
                                "title": "Section 1.1: The Cost of Task Switching",
                                "content": "Every time you check a notification or switch tabs during deep work, your brain pays a cognitive penalty known as attention residue. Returning to full focus takes an average of 23 minutes."
                            },
                            {
                                "title": "Section 1.2: Designing Distraction-Free Environments",
                                "content": "To cultivate flow state, eliminate visual clutter and cognitive noise. Digital tools designed with full-view reading modes, ambient lighting themes, and clean typography empower readers and writers to think deeply without interruption."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Upskill Thoughts: The Innovator's Mindset",
                "subtitle": "Transforming Everyday Ideas Into World-Class Products",
                "genre": "Business & Innovation",
                "language": "English",
                "target_audience": "Innovators, Founders & Dreamers",
                "writing_style": "Practical & Visionary",
                "description": "Learn how to turn creative inspiration into high-impact digital products, build resilient feedback loops, and foster a culture of continuous learning.",
                "status": "Public",
                "views_count": 54100,
                "downloads_count": 620,
                "formatting_preset": "Non-fiction",
                "chapters": [
                    {
                        "title": "Chapter 1: The Power of First Principles Thinking",
                        "summary": "Deconstructing complex problems down to their fundamental truths.",
                        "sections": [
                            {
                                "title": "Section 1.1: Questioning Assumptions",
                                "content": "First principles thinking requires breaking down a problem to its most basic truths and building up from there. Rather than copying existing solutions, innovators ask: 'What is essential, and how can we build it better?'"
                            }
                        ]
                    }
                ]
            }
        ]

        # Seed Demo Books into Database
        for bdata in demo_books_data:
            existing_book = db.query(Book).filter(Book.title == bdata["title"]).first()
            if not existing_book:
                book = Book(
                    title=bdata["title"],
                    subtitle=bdata["subtitle"],
                    author_id=admin_user.id,
                    genre=bdata["genre"],
                    language=bdata["language"],
                    target_audience=bdata["target_audience"],
                    writing_style=bdata["writing_style"],
                    description=bdata["description"],
                    status=bdata["status"],
                    views_count=bdata["views_count"],
                    downloads_count=bdata["downloads_count"],
                    formatting_preset=bdata["formatting_preset"],
                    front_matter_json={
                        "title_page": {"title": bdata["title"], "author": admin_user.full_name},
                        "copyright_page": {"year": "2026", "rights": "All rights reserved."},
                        "dedication": "Dedicated to curious minds and lifelong learners.",
                        "preface": "Welcome to the world of intelligent books."
                    },
                    back_matter_json={
                        "about_author": admin_user.bio,
                        "references": ["PANNA.AI Publishing Library (2026)"]
                    },
                    style_guide_json={
                        "preferred_spelling": "American English",
                        "tone": bdata["writing_style"]
                    }
                )
                db.add(book)
                db.commit()
                db.refresh(book)

                for c_idx, ch_data in enumerate(bdata["chapters"]):
                    ch = Chapter(
                        book_id=book.id,
                        title=ch_data["title"],
                        summary=ch_data["summary"],
                        order_index=c_idx,
                        readability_score=90.0
                    )
                    db.add(ch)
                    db.commit()
                    db.refresh(ch)

                    for s_idx, sec_data in enumerate(ch_data["sections"]):
                        sec = Section(
                            chapter_id=ch.id,
                            title=sec_data["title"],
                            content=sec_data["content"],
                            order_index=s_idx
                        )
                        db.add(sec)
                    db.commit()

        print("Database successfully seeded with 4 rich demo books!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
