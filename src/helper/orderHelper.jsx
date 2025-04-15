export const getClassificationText = (
	rawAttributeOptions,
	productAttributes,
	returnArray = false
) => {
	if (!rawAttributeOptions || !productAttributes) {
		if (returnArray) {
			return []
		}
		return 'Not selected'
	}
	const classificationText = Object.keys(
		JSON.parse(rawAttributeOptions)
	)?.reduce((r, k) => {
		const att = productAttributes?.find(i => i?.attributeId === k)

		const option = att?.attribute?.attributeOptions?.find(
			i => i?.id === JSON.parse(rawAttributeOptions)[k]
		)
		// console.log('🚀 ~ )?.reduce ~ option:', option)
		return [...r, { name: att?.attribute?.name, value: option?.value }]
	}, [])

	if (returnArray) {
		return classificationText
	}
	return classificationText.map(i => `${i.name}: ${i.value}`).toString()
}
export const getClassificationTextDownloadImage = (
	rawAttributeOptions,
	productAttributes
) => {
	const classificationText = Object.keys(
		JSON.parse(rawAttributeOptions)
	)?.reduce((r, k) => {
		const att = productAttributes?.attribute.find(i => i?.id === k)
		// console.log('🚀 ~ classificationText ~ att:', att)

		const option = att?.attribute?.attributeOptions?.find(
			i => i?.id === JSON.parse(rawAttributeOptions)[k]
		)
		console.log(option)
		return [...r, { name: att?.attribute?.name, value: option?.value }]
	}, [])
	return classificationText.map(i => `${i.name}: ${i.value}`).toString()
}

export const findLargestFee = (items, shipping) => {
	const itemsShippingRate = items.map(item => {
		const shippingRates = item.product.ProductShippingRate.filter(
			i => i.country === shipping.country
		)
		const shippingRate = shippingRates.some(i => i?.stateOrRegion === '*')
			? shippingRates.find(i => i?.stateOrRegion === '*')
			: shippingRates.find(i => i?.stateOrRegion === shipping.state)

		return shippingRate
	})
	itemsShippingRate.sort((a, b) => b.firstItemFee - a?.firstItemFee)

	return itemsShippingRate[0]
}

export const calculatePriceItem = formValue => {
	// console.log('🚀 ~ calculatePriceItem ~ formValue:', formValue)
	// console.log('🚀 ~ calculatePriceItem ~ product, item, type, country, state:', formValue)

	const { items, shipping, print_only } = formValue
	if (!items || !shipping) {
		return null
	}

	const calculateItems = []

	let isLargestFeeApplied = false

	for (const item of items) {
		// console.log('🚀 ~ calculateItems ~ item:', item)

		const shippingRates = item.product.ProductShippingRate.filter(
			i => i.country === shipping.country
		)
		const shippingRate = shippingRates.some(i => i?.stateOrRegion === '*')
			? shippingRates.find(i => i?.stateOrRegion === '*')
			: shippingRates.find(i => i?.stateOrRegion === shipping.state)
		// console.log('🚀 ~ shippingRate:', shippingRate)
		const classificationText = getClassificationText(
			item.classification.rawAttributeOptions,
			item.product.productAttributes
		)
		// console.log(classificationText)
		if (!shippingRate && !print_only) {
			return {
				can_transport: false,
				product_name: item.product.name,
				classification: classificationText,
				total: 0
			}
		}

		const printFee = item?.userModelImage?.reduce(
			(prFee, model) => {
				if (model?.id === 'fake-mockup') {
					return prFee
				}
				let currentPrFee = prFee
				// console.log('🚀 ~ calculateItems ~ currentPrFee:', currentPrFee)
				let totalInModel = 0
				let feeInModel = 0

				for (const design_in_model of model?.config) {
					if (design_in_model?.design_url?.startsWith('https://')) {
						totalInModel = totalInModel + 1
						currentPrFee.totalDesign = currentPrFee.totalDesign + 1
						if (currentPrFee.totalDesign > 1) {
							feeInModel =
								feeInModel + model?.additional_printing_price
						}
					}
				}

				const final_in_model = {
					totalInModel,
					feeInModel,
					name: model.name
				}
				return {
					...currentPrFee,
					quantity_in_model: [
						...currentPrFee?.quantity_in_model,
						final_in_model
					],
					totalFee: currentPrFee?.totalFee + feeInModel
				}
			},
			{
				totalDesign: 0,
				quantity_in_model: [],
				totalFee: 0
			}
		)
		// console.log('🚀 ~ calculateItems ~ printFee:', printFee)

		let sh_fee = 0

		if (print_only) {
			sh_fee = item.product.shippingHandlingFee * item.quantity
		} else {
			const largestShippingRate = findLargestFee(items, shipping)

			if (
				largestShippingRate?.id === shippingRate?.id &&
				!isLargestFeeApplied
			) {
				if (item.quantity === 1) {
					sh_fee = shippingRate.firstItemFee
				} else {
					sh_fee =
						shippingRate.firstItemFee +
						shippingRate.additionalItemFee * (item.quantity - 1)
				}
				isLargestFeeApplied = true
			} else {
				// console.log('🚀 ~ calculateItems ~ shippingRate:', shippingRate)
				// console.log(item.quantity)
				sh_fee = shippingRate.additionalItemFee * item.quantity
			}
		}

		const base_price = item.classification.price * item.quantity
		calculateItems.push({
			can_transport: true,
			sh_fee,
			sh_fee_text: `${sh_fee}$`,
			// sh_fee_text:
			// 	sh_fee === 0
			// 		? 'Free'
			// 		: `${sh_fee.toLocaleString()} $ for ${item.quantity} Item(s)`,
			product_name: item.product.name,
			classification: classificationText,
			quantity: item.quantity,
			base_price: item.classification.price,
			// base_price_text: `${item.quantity} x ${item.classification.price?.toLocaleString()} = ${base_price} $`,
			base_price_text: `${base_price}$`,
			total: base_price + sh_fee + printFee.totalFee * item.quantity,
			total_text:
				(
					base_price +
					sh_fee +
					printFee.totalFee * item.quantity
				).toLocaleString() + '$',
			printFee
		})
	}

	const total_bill = calculateItems.reduce((r, i) => {
		return r + i.total
	}, 0)
	return {
		can_create_order: !calculateItems.some(i => !i.can_transport),
		items_calculated: calculateItems,
		total_bill:
			total_bill + (!print_only && shipping?.express_shipping ? 6.5 : 0),
		express_ship: shipping?.express_shipping
	}
}

export function splitItemsRenderToPDF(data) {
	// console.log('🚀 ~ splitItemsRenderToPDF ~ data:', data)
	let { Items, ...rest } = data
	// console.log('🚀 ~ splitItemsRenderToPDF ~ Items:', Items.length)

	if (Items?.length < 2) {
		return [{ ...data, startIndex: 0, Items }]
	}

	const itemTotalDesign = Items.reduce(
		(r, i, i_index) => {
			const totalPerItem = i.rawUserModelImages.filter(i2 =>
				i2?.config?.some(i2_design =>
					i2_design?.design_url?.startsWith('https://')
				)
			).length

			// //MAX 6 DESIGN PER PAGE, more than 6, render in the next page
			const current_total = r.current_total_design + totalPerItem
			const isLastItem = i_index === Items.length - 1

			if (
				current_total <= 3 &&
				totalPerItem <= 3 &&
				r.items_queue.length === 0 &&
				!isLastItem
			) {
				return {
					...r,
					items_queue: [{ ...rest, Items: [i], startIndex: i_index }],
					current_total_design: totalPerItem
				}
			} else {
				const mergeItems =
					totalPerItem > 3
						? [
								...r.items_queue,
								{
									...rest,
									Items: [i],
									startIndex: i_index
								}
							]
						: [
								{
									...rest,
									Items:
										r?.items_queue?.length > 0
											? [...r.items_queue[0].Items, i]
											: [i],
									startIndex: i_index
								}
							]

				return {
					items_queue: [],
					current_total_design: 0,
					pages: [...r?.pages, ...mergeItems]
				}
			}
		},
		{ current_total_design: 0, items_queue: [], pages: [] }
	)

	return itemTotalDesign.pages

	//OLD
	// let { Items, ...rest } = data
	// let result = []
	// let partSize = 1
	// for (let i = 0; i < Items.length; i += partSize) {
	// 	let newItems = Items.slice(i, i + partSize)
	// 	let newObject = {
	// 		...rest,
	// 		Items: newItems,
	// 		startIndex: i
	// 	}
	// 	result.push(newObject)
	// }

	// return result
}
