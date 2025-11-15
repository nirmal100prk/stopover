"use client"

import Image from "next/image"
import { Luggage, User, Shield, Star } from "lucide-react"

interface VendorCardProps {
  vendor: {
    id: number
    name: string
    logo: string
    price: string
    baggage: string
    seatSelection: string
    cancellation: string
    rating: number
    features: string[]
  }
}

export default function VendorCard({ vendor }: VendorCardProps) {
  return (
    <div key={vendor.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-12 h-12 mr-3 relative">
            <Image src={vendor.logo || "/placeholder.svg"} alt={vendor.name} fill className="object-contain" />
          </div>
          <div>
            <div className="font-medium text-lg">{vendor.name}</div>
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center text-yellow-500 mr-1">
                <Star size={14} fill="currentColor" />
              </div>
              <span>{vendor.rating}/5</span>
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold text-lime-600">{vendor.price}</div>
      </div>

      <div className="border-t border-gray-100 my-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-start">
          <Luggage className="text-gray-400 mr-2 mt-0.5" size={16} />
          <div>
            <div className="text-sm font-medium">Baggage</div>
            <div className="text-xs text-gray-500">{vendor.baggage}</div>
          </div>
        </div>
        <div className="flex items-start">
          <User className="text-gray-400 mr-2 mt-0.5" size={16} />
          <div>
            <div className="text-sm font-medium">Seat Selection</div>
            <div className="text-xs text-gray-500">{vendor.seatSelection}</div>
          </div>
        </div>
        <div className="flex items-start">
          <Shield className="text-gray-400 mr-2 mt-0.5" size={16} />
          <div>
            <div className="text-sm font-medium">Cancellation</div>
            <div className="text-xs text-gray-500">{vendor.cancellation}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {vendor.features.map((feature, index) => (
          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {feature}
          </span>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium">Book Now</button>
      </div>
    </div>
  )
}
