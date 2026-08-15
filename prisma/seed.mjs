// Seed the DB with the original portfolio content.
// Run: npm run db:seed  (after npm run db:push)
// Idempotent: content is upserted; tech/projects only seeded when empty.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const content = {
	id: 1,
	heroName: "Hi, I'm Truong Pham",
	heroTagline: 'Open to both freelance and long-term opportunities!',
	heroBio: [
		"I'm currently seeking new opportunities, projects, or full-time roles where I can contribute, grow, and take on new challenges. I'm passionate about building great products and working with motivated teams.",
		'My long-term goal is to transition into a Product Owner or Project Manager role, where I can bring together technical understanding and strategic vision to drive meaningful impact.'
	],
	phone: '0343241299',
	facebookUrl: 'https://facebook.com/truongpham2412',
	avatarUrl: '/avatar.png',
	techHeading: 'My Tech Stack & CV'
}

const techStack = [
	['ReactJS', '/tech_stack/react.png'],
	['NextJS', '/tech_stack/next.png'],
	['ElectronJS', '/tech_stack/electron.png'],
	['NestJS', '/tech_stack/nest.png'],
	['Puppeteer', '/tech_stack/puppeteer.png'],
	['Ant Design UI', '/tech_stack/antd.png'],
	['Shadcn UI', '/tech_stack/shadcn.png'],
	['MUI UI', '/tech_stack/mui.png'],
	['Tailwind CSS', '/tech_stack/tailwind.png'],
	['MongoDB', '/tech_stack/mongo.png'],
	['SQL', '/tech_stack/sql.png'],
	['Docker', '/tech_stack/docker.png']
].map(([name, imageUrl], i) => ({ name, imageUrl, sortOrder: i + 1 }))

const projects = [
	{
		name: 'Rapidprinttee',
		description:
			'Rapidprinttee is a web application developed by a print-on-demand t-shirt workshop targeting the US market. Its core features focus on receiving and processing customer orders.',
		urls: ['https://app.rapidprinttee.com', 'https://rapidprinttee.com'],
		imageUrl: '/project/1.png',
		sortOrder: 1
	},
	{
		name: 'Eduquiz',
		description:
			'Eduquiz is a SaaS website that provides multiple-choice test preparation features for anyone looking to study and improve their memory.',
		urls: ['https://eduquiz.vn'],
		imageUrl: '/project/2.png',
		sortOrder: 2
	},
	{
		name: 'Ielts D1',
		description:
			'Ielts D1 is an educational blog managed by an English language teacher.',
		urls: ['https://www.ieltsd1.com'],
		imageUrl: '/project/3.png',
		sortOrder: 3
	}
]

async function main() {
	await prisma.siteContent.upsert({
		where: { id: 1 },
		update: content,
		create: content
	})

	if ((await prisma.techStack.count()) === 0) {
		await prisma.techStack.createMany({ data: techStack })
	}
	if ((await prisma.project.count()) === 0) {
		await prisma.project.createMany({ data: projects })
	}

	console.log('✅ Seed done')
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
