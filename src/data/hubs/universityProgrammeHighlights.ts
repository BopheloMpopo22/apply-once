export type ProgrammeHighlight = {
  name: string
  description: string
}

export const UNIVERSITY_PROGRAMME_HIGHLIGHTS: Record<string, ProgrammeHighlight[]> = {
  uct: [
    { name: 'Medicine (MBChB)', description: 'Top-ranked medical school in Africa — highly competitive entry, clinical training at Groote Schuur and associated teaching hospitals.' },
    { name: 'Law (LLB)', description: 'Prestigious law faculty with strong moot court culture and pathways into advocacy, corporate law, and public interest work.' },
    { name: 'Engineering', description: 'Civil, electrical, mechanical and chemical engineering through EBE — research-led with industry partnerships.' },
    { name: 'Commerce (BCom)', description: 'Accounting, finance, and actuarial science routes — feeder into CA(SA), investment banking, and consulting.' },
  ],
  wits: [
    { name: 'Mining & Engineering', description: 'Historic strength in mining engineering and geosciences — close ties to Johannesburg industry and research.' },
    { name: 'Health Sciences', description: 'Medicine, nursing, pharmacy, and allied health — strict NBT and subject requirements; earlier deadlines apply.' },
    { name: 'Commerce', description: 'BCom Accounting, Finance, and Economics — major pipeline for CA(SA) articles and corporate careers.' },
    { name: 'Humanities & Law', description: 'Strong BA programmes in politics, international relations, and a competitive LLB with national reputation.' },
  ],
  up: [
    { name: 'Veterinary Science', description: 'Only BVSc programme in Gauteng — closes earlier than general applications; passion for animal health essential.' },
    { name: 'Engineering', description: 'All major engineering disciplines including extended BEng routes for students narrowly below mainstream APS.' },
    { name: 'Law (LLB)', description: 'Large law faculty with options in BA Law and straight LLB — popular for students targeting legal practice.' },
    { name: 'Education', description: 'Foundation phase through FET teaching qualifications — one of the largest education faculties in SA.' },
  ],
  uj: [
    { name: 'Art, Design & Architecture', description: 'Creative hub in Gauteng — portfolio-based entry for design, multimedia, and architectural studies.' },
    { name: 'Engineering', description: 'Extended curriculum options available — mechanical, civil, electrical and industrial engineering with industry focus.' },
    { name: 'Health Sciences', description: 'Nursing, emergency medical care, and related programmes — check extended vs mainstream APS on prospectus.' },
    { name: 'Business (BCom)', description: 'Accounting, marketing, and management with extended BCom streams for students needing academic support.' },
  ],
  ukzn: [
    { name: 'Medicine (MBChB)', description: 'Major medical school in KZN — apply via CAO; closes June for health programmes.' },
    { name: 'Law (LLB)', description: 'Well-regarded law school with access and foundation routes for qualifying students.' },
    { name: 'Agriculture', description: 'Crop science, agribusiness, and animal science — strong research in subtropical farming systems.' },
    { name: 'Engineering', description: 'Civil, chemical, and mechanical engineering across Durban and Pietermaritzburg campuses.' },
  ],
  sun: [
    { name: 'Agriculture & Wine', description: 'World-renowned viticulture and oenology — unique programmes tied to the Cape Winelands industry.' },
    { name: 'Engineering', description: 'Strong mechanical and electrical engineering with Afrikaans and English options on some programmes.' },
    { name: 'Medicine (MBChB)', description: 'Tygerberg-linked clinical training — competitive entry; SciMathUS available if maths/science marks are short.' },
    { name: 'Economic & Management Sciences', description: 'BCom, BAcc, and economics programmes feeding into Stellenbosch’s corporate alumni network.' },
  ],
  nwu: [
    { name: 'Education', description: 'One of SA’s largest teacher-training universities — foundation, intermediate, and FET phase options.' },
    { name: 'Commerce', description: 'BCom across Potchefstroom and Vanderbijlpark — extended programmes available on some campuses.' },
    { name: 'Engineering', description: 'Civil, mechanical, and electrical engineering with extended curriculum routes at select campuses.' },
    { name: 'Agriculture', description: 'Animal science, crop production, and agribusiness — serves North West and national farming sectors.' },
  ],
  ufs: [
    { name: 'Health Sciences', description: 'Medicine, nursing, and allied health — faculty-specific closing dates; selection tests for some programmes.' },
    { name: 'Law (LLB)', description: 'Established law faculty in Bloemfontein — popular for Free State and central SA students.' },
    { name: 'Agriculture', description: 'Crop and animal sciences with research focus on dryland and highveld farming.' },
    { name: 'Humanities', description: 'Social sciences, languages, and BA programmes — University Preparatory Programme (UPP) for access routes.' },
  ],
  nmu: [
    { name: 'Marine Sciences', description: 'Ocean sciences and fisheries — unique coastal location in Gqeberha with fieldwork on the Indian Ocean.' },
    { name: 'Business & Economics', description: 'BCom and BAdmin with extended curriculum options for students below mainstream APS.' },
    { name: 'Engineering', description: 'Civil, mechanical, and mechatronics — technology-focused with industry projects.' },
    { name: 'Education', description: 'Teacher training across phases — strong regional placement in Eastern Cape schools.' },
  ],
  tut: [
    { name: 'Engineering', description: 'Applied engineering diplomas and degrees — workplace-integrated learning across Gauteng campuses.' },
    { name: 'Information Technology', description: 'Software development, computer systems, and networking — strong employer links in Pretoria tech sector.' },
    { name: 'Management', description: 'Human resource, marketing, and logistics management — practical, career-oriented qualifications.' },
    { name: 'Applied Sciences', description: 'Biotechnology, environmental health, and analytical chemistry with lab-heavy training.' },
  ],
  ru: [
    { name: 'Journalism & Media', description: 'Top-ranked school of journalism — small cohorts, strong writing and broadcast training in Makhanda.' },
    { name: 'Pharmacy (BPharm)', description: 'Competitive pharmacy programme with hospital and community placement.' },
    { name: 'Humanities (BA)', description: 'Politics, philosophy, and languages in a small residential university setting.' },
    { name: 'Science (BSc)', description: 'Biological and physical sciences with extended studies option for qualifying applicants.' },
  ],
  uwc: [
    { name: 'Dentistry', description: 'One of few dental schools in SA — highly selective with strict science subject requirements.' },
    { name: 'Community & Public Health', description: 'Public health, social work, and community development — mission-driven health faculty.' },
    { name: 'Law (LLB)', description: 'Historic law faculty with strong human-rights and constitutional law focus.' },
    { name: 'Natural Sciences', description: 'Chemistry, biotechnology, and environmental science with research-led teaching.' },
  ],
  ul: [
    { name: 'Medicine (MBChB)', description: 'Medical school serving Limpopo — earlier closing date; commitment to rural and provincial healthcare.' },
    { name: 'Health Sciences', description: 'Nursing, pharmacy, and rehabilitation sciences across Turfloop and Polokwane campuses.' },
    { name: 'Science (BSc)', description: 'Mathematics, biology, and computer science — extended options for qualifying matriculants.' },
    { name: 'Humanities', description: 'Social sciences, languages, and education — access programmes for disadvantaged schools.' },
  ],
  cput: [
    { name: 'Design & Multimedia', description: 'Graphic design, fashion, and interior design — portfolio submission often required.' },
    { name: 'Engineering', description: 'Civil, mechanical, and electrical engineering with extended programmes on some qualifications.' },
    { name: 'Business', description: 'Marketing, management, and tourism — applied degrees linked to Cape Town service economy.' },
    { name: 'Health Sciences', description: 'Emergency medical care, radiography, and environmental health — selection and fitness tests apply.' },
  ],
  vut: [
    { name: 'Engineering', description: 'Civil, mechanical, and industrial engineering centred in Vanderbijlpark — serves Vaal Triangle industry.' },
    { name: 'Applied Sciences', description: 'Analytical chemistry, biotechnology, and food technology with lab-based training.' },
    { name: 'Management', description: 'Cost and management accounting, logistics, and human resources — BCom and diploma routes.' },
    { name: 'Humanities', description: 'Communication, language, and public management programmes for regional government and media.' },
  ],
  unisa: [
    { name: 'Law (LLB)', description: 'Distance LLB — flexible for working students; requires self-discipline and consistent study schedule.' },
    { name: 'Education', description: 'Large teacher-training provider via open distance — popular for upgrading to BEd while employed.' },
    { name: 'Business (BCom)', description: 'Accounting and management by correspondence — pathway to CIMA, SAICA, and corporate roles.' },
    { name: 'Higher Certificates', description: 'Stepping-stone qualifications in IT, law, and accounting — open access for many matric holders.' },
  ],
  ufh: [
    { name: 'Law (LLB)', description: 'Historic Eastern Cape law faculty — serves Alice, East London, and Bhisho communities.' },
    { name: 'Social Sciences', description: 'Development studies, sociology, and politics — strong community engagement focus.' },
    { name: 'Agriculture', description: 'Crop and livestock science for rural Eastern Cape farming communities.' },
    { name: 'Education', description: 'Teacher training across foundation and senior phases with regional school placement.' },
  ],
  wsu: [
    { name: 'Health Sciences', description: 'Nursing, clinical associates, and public health — serves rural Eastern Cape healthcare needs.' },
    { name: 'Education', description: 'BEd programmes across Mthatha, Buffalo City, and surrounding campuses.' },
    { name: 'Management', description: 'Business administration and accounting for regional enterprise development.' },
    { name: 'Science (BSc)', description: 'Biological and physical sciences with extended curriculum on some streams.' },
  ],
  univen: [
    { name: 'Agriculture', description: 'Crop and animal production tailored to Limpopo agro-ecological conditions.' },
    { name: 'Health Sciences', description: 'Nursing and public health programmes serving rural Limpopo communities.' },
    { name: 'Law (LLB)', description: 'Growing law faculty in Thohoyandou — access routes for qualifying students.' },
    { name: 'Environmental Science', description: 'Ecology, biodiversity, and natural resource management in a biodiversity hotspot.' },
  ],
  unizulu: [
    { name: 'Education', description: 'Major teacher-training provider in northern KZN — apply via CAO.' },
    { name: 'Science (BSc)', description: 'Mathematics, biology, and chemistry with foundation options for access students.' },
    { name: 'Commerce (BCom)', description: 'Accounting and management for KZN north coast and interior learners.' },
    { name: 'Health Sciences', description: 'Nursing and public health programmes with community placement.' },
  ],
  smu: [
    { name: 'Medicine (MBChB)', description: 'Health-sciences-only university in Ga-Rankuwa — all programmes are health-related.' },
    { name: 'Allied Health', description: 'Physiotherapy, occupational therapy, and speech therapy with hospital-based training.' },
    { name: 'Public Health', description: 'MPH and undergraduate public health routes — focus on SA healthcare system challenges.' },
    { name: 'Pharmacy & Nursing', description: 'Professional nursing and pharmacy with strict science prerequisites and NBT requirements.' },
  ],
  ump: [
    { name: 'Agriculture', description: 'Crop and animal production for Mpumalanga farming — young, growing faculty.' },
    { name: 'Education', description: 'Teacher training serving Mpumalanga schools — foundation and intermediate phases.' },
    { name: 'Nature Conservation', description: 'Wildlife and conservation management near Kruger corridor — unique outdoor learning.' },
    { name: 'ICT & Data Science', description: 'Growing tech programmes including data science — modern skills for regional economy.' },
  ],
  spu: [
    { name: 'Education', description: 'Core focus of Kimberley’s newest public university — teacher training for Northern Cape.' },
    { name: 'ICT', description: 'Information technology and computer science — building digital skills in the province.' },
    { name: 'Heritage Studies', description: 'Unique programmes tied to Northern Cape history, archaeology, and cultural tourism.' },
    { name: 'Data Science', description: 'Emerging qualification aligned with government and mining-sector analytics needs.' },
  ],
  dut: [
    { name: 'Engineering', description: 'Civil, mechanical, and chemical engineering with strong Durban industry links.' },
    { name: 'Arts & Design', description: 'Fine art, fashion, and interior design — portfolio and interview selection.' },
    { name: 'Applied Sciences', description: 'Biotechnology, food technology, and environmental health with lab work.' },
    { name: 'Management', description: 'Marketing, hospitality management, and public management — career-focused diplomas and degrees.' },
  ],
  cut: [
    { name: 'Engineering', description: 'Civil, mechanical, and electrical engineering in Bloemfontein — Free State industrial hub.' },
    { name: 'Health Sciences', description: 'Medical orthotics, somatology, and related applied health programmes.' },
    { name: 'Information Technology', description: 'Software development and computer systems — growing IT faculty.' },
    { name: 'Management', description: 'Business and public management qualifications for central SA learners.' },
  ],
  mut: [
    { name: 'Engineering', description: 'Civil, mechanical, and chemical engineering in Umlazi — closes May for engineering via CAO.' },
    { name: 'Natural Sciences', description: 'Chemistry, biotechnology, and environmental science with applied focus.' },
    { name: 'Management', description: 'Cost accounting, logistics, and human resources — BCom and diploma routes.' },
    { name: 'Diplomacy', description: 'Unique international relations and diplomacy programmes on Durban campus.' },
  ],
}
