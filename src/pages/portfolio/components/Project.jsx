import { Link } from 'react-router-dom'
import { TypeAnimation } from 'react-type-animation'

export default function Project() {
	const items = [
		{
			name: 'Rapidprinttee',
			description:
				'Rapidprinttee is a web application developed by a print-on-demand t-shirt workshop targeting the US market. Its core features focus on receiving and processing customer orders.',
			urls: [
				'https://app.rapidprinttee.com',
				'https://rapidprinttee.com'
			],
			image_url: '/project/1.png'
		},
		{
			name: 'Eduquiz',
			description:
				'Eduquiz is a SaaS website that provides multiple-choice test preparation features for anyone looking to study and improve their memory.',
			urls: ['https://eduquiz.vn'],
			image_url: '/project/2.png'
		},
		{
			name: 'Ielts D1',
			description:
				'Ielts D1 is an educational blog managed by an English language teacher.',
			urls: ['https://www.ieltsd1.com'],
			image_url: '/project/3.png'
		}
	]
	return (
		<div className="">
			<h2 className="font-bold text-[2.4rem] md:text-[3.4rem] text-center my-12 sticky top-0 z-[99] bg-black">
				Recent Project
			</h2>
			<div className="py-12 max-w-[1200px] mx-auto container_project">
				{items.map((item, index) => {
					return (
						<div className="grid md:gap-24 lg:grid-cols-2 container_item h-[80vh] max-w-[80%] mx-auto">
							<div className="flex justify-center flex-col ">
								<h3 className="font-bold text-[2rem] md:text-[3rem]">
									{item.name}
								</h3>
								<TypeAnimation
									sequence={[item.description]}
									wrapper="span"
									speed={50}
									style={{
										fontSize: '1.3rem',
										display: 'inline-block'
									}}
									repeat={false}
								/>
								<div className="flex gap-4 flex-wrap ">
									{item.urls.map(u => (
										<Link
											to={u}
											target="_blank"
											key={u}
											className="underline text-blue-600"
										>
											{u}
										</Link>
									))}
								</div>
							</div>
							<img alt="1" src={item.image_url} />{' '}
						</div>
					)
				})}
			</div>
		</div>
	)
}
