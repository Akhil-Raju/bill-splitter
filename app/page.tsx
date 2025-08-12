"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RotateCcw, Plus, Minus, Users, Receipt, Share2 } from "lucide-react"

interface FoodItem {
  id: string
  name: string
  price: number
}

interface Person {
  id: string
  name: string
}

interface Order {
  [personId: string]: {
    [foodId: string]: number
  }
}

interface CommonItems {
  [foodId: string]: number
}

type ViewState = "setup" | "selectPerson" | "ordering" | "commonItems" | "finalBill"

export default function BillSplitter() {
  const [viewState, setViewState] = useState<ViewState>("setup")
  const [currentPersonId, setCurrentPersonId] = useState<string>("")

  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    { id: "1", name: "Puri", price: 8 },
    { id: "2", name: "Appam", price: 8 },
    { id: "3", name: "Dosa", price: 8 },
    { id: "4", name: "Puttu", price: 8 },
    { id: "5", name: "Snacks", price: 7 },
    { id: "6", name: "Kadala Curry", price: 15 },
    { id: "7", name: "Gravy", price: 15 },
    { id: "8", name: "Egg", price: 10 },
    { id: "9", name: "Tea", price: 9 },
    { id: "10", name: "Coffee", price: 10 },
  ])

  const [people, setPeople] = useState<Person[]>([
    { id: "1", name: "Akhil" },
    { id: "2", name: "Vishnu" },
    { id: "3", name: "Riyas" },
    { id: "4", name: "Dinto" },
    { id: "5", name: "Swapna" },
  ])

  const [order, setOrder] = useState<Order>({
    "1": {},
    "2": {},
    "3": {},
    "4": {},
    "5": {},
  })

  const [commonItems, setCommonItems] = useState<CommonItems>({})

  const [newFoodName, setNewFoodName] = useState("")
  const [newFoodPrice, setNewFoodPrice] = useState("")
  const [newPersonName, setNewPersonName] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("canteen-calculator")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setFoodItems(data.foodItems || foodItems)
        setPeople(data.people || people)
        setOrder(data.order || {})
        setCommonItems(data.commonItems || {})
      } catch (e) {
        console.error("Failed to load saved data:", e)
      }
    }
  }, [])

  useEffect(() => {
    const data = { foodItems, people, order, commonItems }
    localStorage.setItem("canteen-calculator", JSON.stringify(data))
  }, [foodItems, people, order, commonItems])

  const addFoodItem = () => {
    if (newFoodName.trim() && newFoodPrice.trim()) {
      const price = Number.parseFloat(newFoodPrice)
      if (price > 0) {
        const newItem: FoodItem = {
          id: Date.now().toString(),
          name: newFoodName.trim(),
          price,
        }
        setFoodItems([...foodItems, newItem])
        setNewFoodName("")
        setNewFoodPrice("")
      }
    }
  }

  const addPerson = () => {
    if (newPersonName.trim()) {
      const newPerson: Person = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
      }
      setPeople([...people, newPerson])
      setNewPersonName("")
      setOrder((prev) => ({
        ...prev,
        [newPerson.id]: {},
      }))
    }
  }

  const updateQuantity = (personId: string, foodId: string, change: number) => {
    setOrder((prev) => {
      const currentQty = prev[personId]?.[foodId] || 0
      const newQty = Math.max(0, currentQty + change)

      return {
        ...prev,
        [personId]: {
          ...prev[personId],
          [foodId]: newQty,
        },
      }
    })
  }

  const updateCommonQuantity = (foodId: string, change: number) => {
    setCommonItems((prev) => {
      const currentQty = prev[foodId] || 0
      const newQty = Math.max(0, currentQty + change)

      if (newQty === 0) {
        const { [foodId]: removed, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [foodId]: newQty,
      }
    })
  }

  const calculatePersonTotal = (personId: string) => {
    let total = 0
    foodItems.forEach((food) => {
      const quantity = order[personId]?.[food.id] || 0
      total += quantity * food.price
    })
    return total
  }

  const calculateCommonTotal = () => {
    let total = 0
    foodItems.forEach((food) => {
      const quantity = commonItems[food.id] || 0
      total += quantity * food.price
    })
    return total
  }

  const getPresentPeople = () => {
    return people.filter((person) => {
      const personOrder = order[person.id] || {}
      return Object.values(personOrder).some((qty) => qty > 0)
    })
  }

  const calculatePersonTotalWithSplit = (personId: string) => {
    const individualTotal = calculatePersonTotal(personId)
    const presentPeople = getPresentPeople()
    const commonSplit = presentPeople.length > 0 ? calculateCommonTotal() / presentPeople.length : 0
    return individualTotal + commonSplit
  }

  const calculateGrandTotal = () => {
    const presentPeople = getPresentPeople()
    const individualTotal = presentPeople.reduce((total, person) => total + calculatePersonTotal(person.id), 0)
    const commonTotal = calculateCommonTotal()
    return individualTotal + commonTotal
  }

  const getTotalQuantityForItem = (foodId: string) => {
    const individualQty = people.reduce((total, person) => {
      return total + (order[person.id]?.[foodId] || 0)
    }, 0)
    const commonQty = commonItems[foodId] || 0
    return individualQty + commonQty
  }

  const resetAll = () => {
    setOrder(Object.fromEntries(people.map((p) => [p.id, {}])))
    setCommonItems({})
    setViewState("setup")
    setCurrentPersonId("")
  }

  const currentPerson = people.find((p) => p.id === currentPersonId)

  if (viewState === "setup") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Canteen Calculator</h1>
            <p className="text-gray-600">Setup your menu and friends</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Menu Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Food name"
                  value={newFoodName}
                  onChange={(e) => setNewFoodName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="₹"
                  type="number"
                  value={newFoodPrice}
                  onChange={(e) => setNewFoodPrice(e.target.value)}
                  className="w-20"
                />
                <Button onClick={addFoodItem} size="sm">
                  +
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {foodItems.map((item) => (
                  <div key={item.id} className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-blue-600 font-bold">₹{item.price}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Friend's name"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addPerson} size="sm">
                  +
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {people.map((person) => (
                  <div key={person.id} className="bg-green-50 px-3 py-2 rounded-full">
                    <span className="font-medium text-sm">{person.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => setViewState("selectPerson")}
            className="w-full h-12 text-lg"
            disabled={foodItems.length === 0 || people.length === 0}
          >
            <Users className="w-5 h-5 mr-2" />
            Start Ordering
          </Button>
        </div>
      </div>
    )
  }

  if (viewState === "selectPerson") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setViewState("setup")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Select Person</h1>
              <p className="text-gray-600 text-sm">Tap to place their order</p>
            </div>
          </div>

          <div className="space-y-3">
            {people.map((person) => (
              <Button
                key={person.id}
                variant="outline"
                className="w-full h-16 text-lg justify-between bg-transparent"
                onClick={() => {
                  setCurrentPersonId(person.id)
                  setViewState("ordering")
                }}
              >
                <span>{person.name}</span>
                <div className="text-right">
                  <div className="font-bold text-green-600">₹{calculatePersonTotal(person.id)}</div>
                  <div className="text-xs text-gray-500">Individual total</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t space-y-3">
            <Button onClick={() => setViewState("commonItems")} className="w-full h-12" variant="outline">
              <Share2 className="w-5 h-5 mr-2" />
              Add Common Items (₹{calculateCommonTotal()})
            </Button>

            <Button onClick={() => setViewState("finalBill")} className="w-full h-12" variant="default">
              <Receipt className="w-5 h-5 mr-2" />
              Show Final Bill
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (viewState === "ordering" && currentPerson) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setViewState("selectPerson")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{currentPerson.name}'s Order</h1>
              <div className="text-2xl font-bold text-green-600">₹{calculatePersonTotal(currentPersonId)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {foodItems.map((food) => {
              const quantity = order[currentPersonId]?.[food.id] || 0
              return (
                <Card key={food.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{food.name}</div>
                      <div className="text-green-600 font-bold">₹{food.price}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(currentPersonId, food.id, -1)}
                        disabled={quantity === 0}
                        className="w-10 h-10 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <div className="w-12 text-center">
                        <div className="text-xl font-bold">{quantity}</div>
                        {quantity > 0 && <div className="text-xs text-gray-500">₹{quantity * food.price}</div>}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(currentPersonId, food.id, 1)}
                        className="w-10 h-10 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <Button onClick={() => setViewState("selectPerson")} className="w-full h-12 mt-6">
            Done with {currentPerson.name}
          </Button>
        </div>
      </div>
    )
  }

  if (viewState === "commonItems") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setViewState("selectPerson")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Common Items</h1>
              <p className="text-sm text-gray-600">Split equally among {people.length} people</p>
              <div className="text-2xl font-bold text-blue-600">₹{calculateCommonTotal()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {foodItems.map((food) => {
              const quantity = commonItems[food.id] || 0
              return (
                <Card key={food.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{food.name}</div>
                      <div className="text-blue-600 font-bold">₹{food.price}</div>
                      {quantity > 0 && (
                        <div className="text-xs text-gray-500">
                          ₹{((quantity * food.price) / people.length).toFixed(1)} per person
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCommonQuantity(food.id, -1)}
                        disabled={quantity === 0}
                        className="w-10 h-10 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <div className="w-12 text-center">
                        <div className="text-xl font-bold">{quantity}</div>
                        {quantity > 0 && <div className="text-xs text-gray-500">₹{quantity * food.price}</div>}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCommonQuantity(food.id, 1)}
                        className="w-10 h-10 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <Button onClick={() => setViewState("selectPerson")} className="w-full h-12 mt-6">
            Done with Common Items
          </Button>
        </div>
      </div>
    )
  }

  if (viewState === "finalBill") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setViewState("selectPerson")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Final Bill</h1>
          </div>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-700">₹{calculateGrandTotal()}</div>
              <div className="text-green-600">Total Bill</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {foodItems
                .filter((food) => getTotalQuantityForItem(food.id) > 0)
                .map((food) => {
                  const totalQty = getTotalQuantityForItem(food.id)
                  const individualQty = people.reduce((total, person) => {
                    return total + (order[person.id]?.[food.id] || 0)
                  }, 0)
                  const commonQty = commonItems[food.id] || 0

                  return (
                    <div key={food.id} className="flex justify-between items-center">
                      <div>
                        <span>{food.name}</span>
                        {commonQty > 0 && (
                          <div className="text-xs text-gray-500">
                            {individualQty > 0 && `${individualQty} individual`}
                            {individualQty > 0 && commonQty > 0 && " + "}
                            {commonQty > 0 && `${commonQty} shared`}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {totalQty} × ₹{food.price}
                        </div>
                        <div className="text-sm text-gray-600">₹{totalQty * food.price}</div>
                      </div>
                    </div>
                  )
                })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Individual Amounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getPresentPeople().map((person) => {
                const individualTotal = calculatePersonTotal(person.id)
                const presentPeople = getPresentPeople()
                const commonSplit = presentPeople.length > 0 ? calculateCommonTotal() / presentPeople.length : 0
                const finalTotal = individualTotal + commonSplit

                return (
                  <div key={person.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{person.name}</span>
                      <span className="font-bold text-lg">₹{finalTotal.toFixed(1)}</span>
                    </div>
                    {commonSplit > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        ₹{individualTotal} individual + ₹{commonSplit.toFixed(1)} shared
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetAll} className="flex-1 bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Order
            </Button>
            <Button onClick={() => setViewState("selectPerson")} className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Add More
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
