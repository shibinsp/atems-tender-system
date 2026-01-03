"""
Seed script to populate the database with realistic dummy data
Run: python seed_data.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
import random
from app.database import SessionLocal, create_tables
from app.models.user import User, Department, Category, UserRole
from app.models.tender import Tender, TenderDocument, TenderEligibility, EvaluationCriteria, TenderStatus, TenderType, TenderStage
from app.models.bid import Bidder, Bid, BidDocument, BidStatus
from app.core.security import get_password_hash

db = SessionLocal()

def seed():
    print("🌱 Seeding database with realistic data...")
    
    # Clear existing data
    db.query(BidDocument).delete()
    db.query(Bid).delete()
    db.query(Bidder).delete()
    db.query(EvaluationCriteria).delete()
    db.query(TenderEligibility).delete()
    db.query(TenderDocument).delete()
    db.query(Tender).delete()
    db.query(User).delete()
    db.query(Category).delete()
    db.query(Department).delete()
    db.commit()
    
    # Departments
    departments = [
        {"name": "Ministry of Electronics & IT", "code": "MEITY"},
        {"name": "Ministry of Health & Family Welfare", "code": "MOHFW"},
        {"name": "Ministry of Road Transport", "code": "MORTH"},
        {"name": "Ministry of Defence", "code": "MOD"},
        {"name": "Ministry of Railways", "code": "MOR"},
        {"name": "Ministry of Education", "code": "MOE"},
        {"name": "Public Works Department", "code": "PWD"},
        {"name": "Municipal Corporation", "code": "MC"},
    ]
    dept_objs = []
    for d in departments:
        dept = Department(**d, is_active=True)
        db.add(dept)
        dept_objs.append(dept)
    db.commit()
    print(f"✅ Created {len(departments)} departments")

    # Categories
    categories = [
        {"name": "IT Hardware & Equipment", "code": "IT-HW", "description": "Computers, servers, networking equipment"},
        {"name": "Software Development", "code": "SW-DEV", "description": "Custom software and application development"},
        {"name": "Civil Construction", "code": "CIVIL", "description": "Building and infrastructure construction"},
        {"name": "Medical Equipment", "code": "MED-EQ", "description": "Hospital and medical devices"},
        {"name": "Office Supplies", "code": "OFF-SUP", "description": "Stationery and office consumables"},
        {"name": "Vehicles & Transport", "code": "VEH", "description": "Government vehicles and transport"},
        {"name": "Consultancy Services", "code": "CONSULT", "description": "Professional consulting services"},
        {"name": "Security Services", "code": "SEC", "description": "Security and surveillance services"},
        {"name": "Electrical Works", "code": "ELEC", "description": "Electrical installation and maintenance"},
        {"name": "Furniture & Fixtures", "code": "FURN", "description": "Office and institutional furniture"},
    ]
    cat_objs = []
    for c in categories:
        cat = Category(**c, is_active=True)
        db.add(cat)
        cat_objs.append(cat)
    db.commit()
    print(f"✅ Created {len(categories)} categories")

    # Users
    users_data = [
        {"email": "admin@gov.in", "full_name": "Rajesh Kumar Singh", "phone": "9876543210", "role": UserRole.ADMIN, "dept_idx": 0},
        {"email": "officer1@meity.gov.in", "full_name": "Priya Sharma", "phone": "9876543211", "role": UserRole.TENDER_OFFICER, "dept_idx": 0},
        {"email": "officer2@mohfw.gov.in", "full_name": "Amit Patel", "phone": "9876543212", "role": UserRole.TENDER_OFFICER, "dept_idx": 1},
        {"email": "officer3@morth.gov.in", "full_name": "Sunita Verma", "phone": "9876543213", "role": UserRole.TENDER_OFFICER, "dept_idx": 2},
        {"email": "eval1@gov.in", "full_name": "Dr. Vikram Reddy", "phone": "9876543214", "role": UserRole.EVALUATOR, "dept_idx": 0},
        {"email": "eval2@gov.in", "full_name": "Meera Krishnan", "phone": "9876543215", "role": UserRole.EVALUATOR, "dept_idx": 1},
        {"email": "eval3@gov.in", "full_name": "Arun Joshi", "phone": "9876543216", "role": UserRole.EVALUATOR, "dept_idx": 2},
        {"email": "viewer@gov.in", "full_name": "Kavita Nair", "phone": "9876543217", "role": UserRole.VIEWER, "dept_idx": 0},
    ]
    
    user_objs = []
    for u in users_data:
        user = User(
            email=u["email"],
            password_hash=get_password_hash("Password@123"),
            full_name=u["full_name"],
            phone=u["phone"],
            role=u["role"],
            department_id=dept_objs[u["dept_idx"]].id,
            is_active=True,
            is_verified=True
        )
        db.add(user)
        user_objs.append(user)
    db.commit()
    print(f"✅ Created {len(users_data)} staff users")

    # Bidder Users and Profiles
    bidders_data = [
        {"email": "procurement@tcs.com", "full_name": "Sanjay Mehta", "company": "Tata Consultancy Services Ltd", "reg": "U72200MH1995PLC084781", "gst": "27AAACT2727Q1ZW", "turnover": 150000000000, "employees": 500000},
        {"email": "tenders@infosys.com", "full_name": "Lakshmi Narayanan", "company": "Infosys Limited", "reg": "U72200KA1981PLC004520", "gst": "29AABCI1234F1ZH", "turnover": 120000000000, "employees": 300000},
        {"email": "govt@wipro.com", "full_name": "Anand Krishnan", "company": "Wipro Limited", "reg": "L32102KA1945PLC020800", "gst": "29AABCW1234E1ZG", "turnover": 80000000000, "employees": 250000},
        {"email": "sales@hcl.com", "full_name": "Ramesh Gupta", "company": "HCL Technologies Ltd", "reg": "U74140DL1991PLC046369", "gst": "07AAACH1234D1ZF", "turnover": 90000000000, "employees": 200000},
        {"email": "bids@larsentoubro.com", "full_name": "Venkatesh Iyer", "company": "Larsen & Toubro Limited", "reg": "L99999MH1946PLC004768", "gst": "27AAACL1234C1ZE", "turnover": 200000000000, "employees": 350000},
        {"email": "tender@shapoorji.com", "full_name": "Cyrus Mistry", "company": "Shapoorji Pallonji Group", "reg": "U45200MH1960PLC011840", "gst": "27AAACS1234B1ZD", "turnover": 50000000000, "employees": 60000},
        {"email": "govt@philips.co.in", "full_name": "Anil Sharma", "company": "Philips India Ltd", "reg": "U31909WB1930PLC007079", "gst": "19AAACP1234A1ZC", "turnover": 25000000000, "employees": 15000},
        {"email": "sales@siemens.co.in", "full_name": "Klaus Mueller", "company": "Siemens Healthcare Pvt Ltd", "reg": "U33112MH1957PTC010839", "gst": "27AAACS5678D1ZB", "turnover": 35000000000, "employees": 20000},
        {"email": "tenders@godrej.com", "full_name": "Nadir Godrej", "company": "Godrej & Boyce Mfg Co Ltd", "reg": "U28900MH1932PLC001560", "gst": "27AAACG1234F1ZA", "turnover": 15000000000, "employees": 12000},
        {"email": "bids@mahindra.com", "full_name": "Rajiv Bajaj", "company": "Mahindra & Mahindra Ltd", "reg": "L65990MH1945PLC004558", "gst": "27AAACM1234G1ZZ", "turnover": 100000000000, "employees": 80000},
    ]
    
    bidder_users = []
    bidder_objs = []
    for b in bidders_data:
        user = User(
            email=b["email"],
            password_hash=get_password_hash("Bidder@123"),
            full_name=b["full_name"],
            phone=f"98{random.randint(10000000, 99999999)}",
            role=UserRole.BIDDER,
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.flush()
        
        bidder = Bidder(
            user_id=user.id,
            company_name=b["company"],
            registration_number=b["reg"],
            gst_number=b["gst"],
            pan_number=f"AAAC{chr(65+random.randint(0,25))}{random.randint(1000,9999)}{chr(65+random.randint(0,25))}",
            address=f"{random.randint(1,500)}, Industrial Area, Phase {random.randint(1,5)}",
            city=random.choice(["Mumbai", "Bangalore", "Delhi", "Chennai", "Hyderabad", "Pune"]),
            state=random.choice(["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Telangana"]),
            country="India",
            pincode=f"{random.randint(100000, 999999)}",
            established_year=random.randint(1950, 2010),
            annual_turnover=b["turnover"],
            employee_count=b["employees"],
            is_msme=b["turnover"] < 50000000000,
            is_verified=True
        )
        db.add(bidder)
        bidder_users.append(user)
        bidder_objs.append(bidder)
    db.commit()
    print(f"✅ Created {len(bidders_data)} bidder companies")

    # Tenders
    tenders_data = [
        {
            "title": "Supply and Installation of Desktop Computers and Peripherals for Government Offices",
            "desc": "Procurement of 5000 desktop computers with monitors, keyboards, and UPS systems for various government offices across the state. The computers should meet BIS standards and come with 3-year onsite warranty.",
            "type": TenderType.OPEN, "stage": TenderStage.TWO_STAGE, "value": 25000000000, "emd": 50000000,
            "dept_idx": 0, "cat_idx": 0, "status": TenderStatus.PUBLISHED, "days_offset": -10
        },
        {
            "title": "Development of Integrated e-Governance Portal for Citizen Services",
            "desc": "Design, development, and maintenance of a comprehensive e-governance portal integrating 150+ citizen services with Aadhaar authentication, payment gateway, and mobile app.",
            "type": TenderType.TWO_STAGE, "stage": TenderStage.TWO_STAGE, "value": 85000000000, "emd": 170000000,
            "dept_idx": 0, "cat_idx": 1, "status": TenderStatus.PUBLISHED, "days_offset": -5
        },
        {
            "title": "Construction of 500-Bed Super Specialty Hospital Building",
            "desc": "Construction of a state-of-the-art 500-bed super specialty hospital including OPD block, IPD block, emergency wing, diagnostic center, and parking facility. Total built-up area: 2,50,000 sq.ft.",
            "type": TenderType.OPEN, "stage": TenderStage.TWO_STAGE, "value": 450000000000, "emd": 900000000,
            "dept_idx": 1, "cat_idx": 2, "status": TenderStatus.PUBLISHED, "days_offset": -15
        },
        {
            "title": "Supply of Advanced Medical Imaging Equipment - CT Scan and MRI Machines",
            "desc": "Procurement of 10 units of 128-slice CT scanners and 5 units of 3T MRI machines for district hospitals with installation, training, and 5-year comprehensive maintenance.",
            "type": TenderType.LIMITED, "stage": TenderStage.SINGLE, "value": 120000000000, "emd": 240000000,
            "dept_idx": 1, "cat_idx": 3, "status": TenderStatus.UNDER_EVALUATION, "days_offset": -30
        },
        {
            "title": "Four-Laning of National Highway NH-48 (Km 125 to Km 180)",
            "desc": "Four-laning of 55 km stretch of NH-48 including construction of 3 flyovers, 2 underpasses, service roads, and drainage system under Bharatmala Pariyojana.",
            "type": TenderType.OPEN, "stage": TenderStage.TWO_STAGE, "value": 850000000000, "emd": 1700000000,
            "dept_idx": 2, "cat_idx": 2, "status": TenderStatus.PUBLISHED, "days_offset": -8
        },
        {
            "title": "Annual Maintenance Contract for Government Vehicle Fleet",
            "desc": "Comprehensive AMC for 2500 government vehicles including sedans, SUVs, and buses. Services include preventive maintenance, breakdown support, and spare parts.",
            "type": TenderType.OPEN, "stage": TenderStage.SINGLE, "value": 15000000000, "emd": 30000000,
            "dept_idx": 2, "cat_idx": 5, "status": TenderStatus.AWARDED, "days_offset": -60
        },
        {
            "title": "Supply of Laboratory Equipment for Government Engineering Colleges",
            "desc": "Procurement of advanced laboratory equipment for 25 government engineering colleges including electronics lab, computer lab, mechanical workshop, and physics lab equipment.",
            "type": TenderType.OPEN, "stage": TenderStage.SINGLE, "value": 35000000000, "emd": 70000000,
            "dept_idx": 5, "cat_idx": 0, "status": TenderStatus.DRAFT, "days_offset": 0
        },
        {
            "title": "Implementation of Smart Classroom Solution in Government Schools",
            "desc": "Supply and installation of smart classroom equipment including interactive displays, projectors, audio systems, and content management system for 1000 government schools.",
            "type": TenderType.OPEN, "stage": TenderStage.TWO_STAGE, "value": 50000000000, "emd": 100000000,
            "dept_idx": 5, "cat_idx": 0, "status": TenderStatus.PUBLISHED, "days_offset": -3
        },
        {
            "title": "Consultancy Services for Smart City Master Plan Development",
            "desc": "Engagement of consultancy firm for preparation of comprehensive smart city master plan including urban planning, ICT infrastructure, sustainable development, and implementation roadmap.",
            "type": TenderType.TWO_STAGE, "stage": TenderStage.TWO_STAGE, "value": 8000000000, "emd": 16000000,
            "dept_idx": 7, "cat_idx": 6, "status": TenderStatus.UNDER_EVALUATION, "days_offset": -25
        },
        {
            "title": "Supply of Office Furniture for New Government Secretariat Building",
            "desc": "Supply and installation of modular office furniture including workstations, executive desks, conference tables, chairs, and storage units for the new secretariat building.",
            "type": TenderType.OPEN, "stage": TenderStage.SINGLE, "value": 12000000000, "emd": 24000000,
            "dept_idx": 6, "cat_idx": 9, "status": TenderStatus.PUBLISHED, "days_offset": -12
        },
        {
            "title": "Integrated Security System for Government Buildings",
            "desc": "Design, supply, installation, and maintenance of integrated security system including CCTV, access control, intrusion detection, and command center for 50 government buildings.",
            "type": TenderType.LIMITED, "stage": TenderStage.TWO_STAGE, "value": 28000000000, "emd": 56000000,
            "dept_idx": 3, "cat_idx": 7, "status": TenderStatus.PUBLISHED, "days_offset": -7
        },
        {
            "title": "Electrical Infrastructure Upgrade for Industrial Estate",
            "desc": "Upgradation of electrical infrastructure including 33KV substation, distribution network, street lighting, and smart metering for the industrial estate spanning 500 acres.",
            "type": TenderType.OPEN, "stage": TenderStage.SINGLE, "value": 65000000000, "emd": 130000000,
            "dept_idx": 6, "cat_idx": 8, "status": TenderStatus.EVALUATED, "days_offset": -45
        },
    ]
    
    tender_objs = []
    for i, t in enumerate(tenders_data):
        base_date = datetime.now() + timedelta(days=t["days_offset"])
        tender = Tender(
            tender_id=f"TENDER/{datetime.now().year}/{dept_objs[t['dept_idx']].code}/{str(i+1).zfill(4)}",
            reference_number=f"F.No.{random.randint(1,50)}/{random.randint(1,20)}/{datetime.now().year}-{dept_objs[t['dept_idx']].code}",
            title=t["title"],
            description=t["desc"],
            category_id=cat_objs[t["cat_idx"]].id,
            department_id=dept_objs[t["dept_idx"]].id,
            tender_type=t["type"],
            tender_stage=t["stage"],
            estimated_value=t["value"],
            currency="INR",
            emd_amount=t["emd"],
            emd_type="Bank Guarantee",
            bid_validity_days=90,
            status=t["status"],
            publishing_date=base_date if t["status"] != TenderStatus.DRAFT else None,
            document_download_start=base_date,
            document_download_end=base_date + timedelta(days=20),
            submission_start=base_date,
            submission_deadline=base_date + timedelta(days=25),
            technical_opening_date=base_date + timedelta(days=27),
            financial_opening_date=base_date + timedelta(days=35),
            created_by=user_objs[t["dept_idx"] % 3 + 1].id
        )
        db.add(tender)
        tender_objs.append(tender)
    db.commit()
    print(f"✅ Created {len(tenders_data)} tenders")

    # Eligibility Criteria for tenders
    eligibility_types = [
        ("Minimum Annual Turnover", "₹50 Crore average for last 3 financial years"),
        ("Years of Experience", "Minimum 5 years in similar projects"),
        ("ISO Certification", "ISO 9001:2015 and ISO 27001 certified"),
        ("GST Registration", "Valid GST registration certificate"),
        ("PAN Card", "Valid PAN card of the company"),
        ("EMD Submission", "EMD as per tender document"),
        ("No Blacklisting", "Not blacklisted by any government agency"),
        ("Technical Capability", "Demonstrated technical capability in similar projects"),
    ]
    
    for tender in tender_objs:
        for i, (ctype, cvalue) in enumerate(random.sample(eligibility_types, min(5, len(eligibility_types)))):
            elig = TenderEligibility(
                tender_id=tender.id,
                criteria_type=ctype,
                criteria_value=cvalue,
                is_mandatory=i < 3,
                sort_order=i
            )
            db.add(elig)
    db.commit()
    print("✅ Added eligibility criteria")

    # Evaluation Criteria
    eval_criteria = [
        ("Technical Approach & Methodology", "technical", 30),
        ("Past Experience & Track Record", "technical", 25),
        ("Team Composition & Expertise", "technical", 20),
        ("Project Management Plan", "technical", 15),
        ("Quality Assurance Plan", "technical", 10),
    ]
    
    for tender in tender_objs:
        for name, ctype, score in eval_criteria:
            ec = EvaluationCriteria(
                tender_id=tender.id,
                criteria_name=name,
                criteria_type=ctype,
                max_score=score,
                weight=score/100,
                is_mandatory=True
            )
            db.add(ec)
    db.commit()
    print("✅ Added evaluation criteria")

    # Bids for published/under evaluation tenders
    bid_count = 0
    for tender in tender_objs:
        if tender.status in [TenderStatus.PUBLISHED, TenderStatus.UNDER_EVALUATION, TenderStatus.EVALUATED, TenderStatus.AWARDED]:
            num_bids = random.randint(3, 6)
            selected_bidders = random.sample(bidder_objs, min(num_bids, len(bidder_objs)))
            
            for rank, bidder in enumerate(selected_bidders):
                variation = random.uniform(0.85, 1.15)
                bid_amount = float(tender.estimated_value) * variation
                
                bid = Bid(
                    bid_number=f"BID/{tender.tender_id.split('/')[-1]}/{str(rank+1).zfill(3)}",
                    tender_id=tender.id,
                    bidder_id=bidder.id,
                    status=BidStatus.SUBMITTED if tender.status == TenderStatus.PUBLISHED else 
                           BidStatus.QUALIFIED if tender.status in [TenderStatus.UNDER_EVALUATION, TenderStatus.EVALUATED] else
                           BidStatus.AWARDED if rank == 0 and tender.status == TenderStatus.AWARDED else BidStatus.QUALIFIED,
                    submission_date=tender.submission_deadline - timedelta(days=random.randint(1, 5)),
                    financial_amount=bid_amount,
                    technical_score=random.uniform(65, 95) if tender.status != TenderStatus.PUBLISHED else None,
                    is_responsive=True,
                    is_qualified=True
                )
                db.add(bid)
                bid_count += 1
    db.commit()
    print(f"✅ Created {bid_count} bids")

    print("\n🎉 Database seeding completed successfully!")
    print("\n📋 Login Credentials:")
    print("=" * 50)
    print("Admin:          admin@gov.in / Password@123")
    print("Tender Officer: officer1@meity.gov.in / Password@123")
    print("Evaluator:      eval1@gov.in / Password@123")
    print("Bidder:         procurement@tcs.com / Bidder@123")
    print("=" * 50)

if __name__ == "__main__":
    create_tables()
    seed()
    db.close()
