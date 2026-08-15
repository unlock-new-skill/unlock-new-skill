// Fallback content = the original hardcoded portfolio data.
// Used when Supabase is not configured yet, or a table is empty.
// Also serves as the seed source for the SQL in db/schema.sql.

export const defaultContent = {
	hero_name: "Hi, I'm Truong Pham",
	hero_tagline: 'Open to both freelance and long-term opportunities!',
	hero_bio: [
		"I'm currently seeking new opportunities, projects, or full-time roles where I can contribute, grow, and take on new challenges. I'm passionate about building great products and working with motivated teams.",
		'My long-term goal is to transition into a Product Owner or Project Manager role, where I can bring together technical understanding and strategic vision to drive meaningful impact.'
	],
	phone: '0343241299',
	facebook_url: 'https://facebook.com/truongpham2412',
	avatar_url: '/avatar.png',
	tech_heading: 'My Tech Stack & CV'
}

export const defaultTechStack = [
	{ id: 't1', name: 'ReactJS', image_url: '/tech_stack/react.png', sort_order: 1 },
	{ id: 't2', name: 'NextJS', image_url: '/tech_stack/next.png', sort_order: 2 },
	{ id: 't3', name: 'ElectronJS', image_url: '/tech_stack/electron.png', sort_order: 3 },
	{ id: 't4', name: 'NestJS', image_url: '/tech_stack/nest.png', sort_order: 4 },
	{ id: 't5', name: 'Puppeteer', image_url: '/tech_stack/puppeteer.png', sort_order: 5 },
	{ id: 't6', name: 'Ant Design UI', image_url: '/tech_stack/antd.png', sort_order: 6 },
	{ id: 't7', name: 'Shadcn UI', image_url: '/tech_stack/shadcn.png', sort_order: 7 },
	{ id: 't8', name: 'MUI UI', image_url: '/tech_stack/mui.png', sort_order: 8 },
	{ id: 't9', name: 'Tailwind CSS', image_url: '/tech_stack/tailwind.png', sort_order: 9 },
	{ id: 't10', name: 'MongoDB', image_url: '/tech_stack/mongo.png', sort_order: 10 },
	{ id: 't11', name: 'SQL', image_url: '/tech_stack/sql.png', sort_order: 11 },
	{ id: 't12', name: 'Docker', image_url: '/tech_stack/docker.png', sort_order: 12 }
]

export const defaultProjects = [
	{
		id: 'p1',
		name: 'Rapidprinttee',
		description:
			'Rapidprinttee is a web application developed by a print-on-demand t-shirt workshop targeting the US market. Its core features focus on receiving and processing customer orders.',
		urls: ['https://app.rapidprinttee.com', 'https://rapidprinttee.com'],
		image_url: '/project/1.png',
		sort_order: 1
	},
	{
		id: 'p2',
		name: 'Eduquiz',
		description:
			'Eduquiz is a SaaS website that provides multiple-choice test preparation features for anyone looking to study and improve their memory.',
		urls: ['https://eduquiz.vn'],
		image_url: '/project/2.png',
		sort_order: 2
	},
	{
		id: 'p3',
		name: 'Ielts D1',
		description:
			'Ielts D1 is an educational blog managed by an English language teacher.',
		urls: ['https://www.ieltsd1.com'],
		image_url: '/project/3.png',
		sort_order: 3
	}
]

// No default companies — user adds them via admin.
export const defaultCompanies = []

export const defaultCv = { url: '/cv1.pdf' }

export const defaultPortfolio = {
	content: defaultContent,
	tech: defaultTechStack,
	projects: defaultProjects,
	companies: defaultCompanies,
	cv: defaultCv
}
