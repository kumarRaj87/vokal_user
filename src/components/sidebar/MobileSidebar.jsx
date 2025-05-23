import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MdSpaceDashboard } from "react-icons/md";
import { MdDialerSip } from "react-icons/md";
import { MdPhoneForwarded } from "react-icons/md";
import { MdWifiCalling3 } from "react-icons/md";
import { IoMdMail } from "react-icons/io";
import { FaSave } from "react-icons/fa";
import { MdOutlineSupportAgent } from "react-icons/md";
import { AiOutlineDollar } from "react-icons/ai";
import {
    Contact,
    ArrowDownUp
} from 'lucide-react'
import { TbArrowFork } from "react-icons/tb";
import { TbPhoneRinging } from "react-icons/tb";
import { PiPhonePlusBold } from "react-icons/pi";

const MobileSidebar = ({ isOpen, onClose }) => {
    const location = useLocation()

    const menuItems = [
        { divider: true, label: 'Useful' },
        { path: '/dashboard', icon: MdSpaceDashboard, label: 'Dashboard' },
        { divider: true, label: 'Voice' },
        { path: '/dialer', icon: MdDialerSip, label: 'dialer' },
        { path: '/prepare-device', icon: MdWifiCalling3, label: 'Prepare device' },
        { path: '/call-broadcast', icon: MdPhoneForwarded, label: 'Call Broadcast' },
        { divider: true, label: 'Messaging' },
        { path: '/messaging', icon: IoMdMail, label: 'Messaging' },
        { divider: true, label: 'Productivity' },
        { path: '/phone-book', icon: Contact, label: 'Phonebook' },
        { path: '/callflow', icon: ArrowDownUp, label: 'Call flow builder' },
        { path: '/callflow-capture', icon: FaSave, label: 'Call flow capture' },
        { divider: true, label: 'Plans' },
        { path: '/plans', icon: AiOutlineDollar, label: 'Plans' },
        { divider: true, label: 'Agent Management' },
        { path: '/create-agent', icon: MdOutlineSupportAgent, label: 'Create agent' },
        { path: '/call-force', icon: TbArrowFork, label: 'Call Force' },
        { path: '/incoming-agent', icon: TbPhoneRinging, label: 'Agent Incoming Calls' },
        { divider: true, label: 'Config' },
        { path: '/device-manager', icon: PiPhonePlusBold, label: 'Device Manager' },
    ]

    const isActive = (path) => {
        return location.pathname === path
    }

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[5500]"
                    onClick={onClose}
                />
            )}

            <aside
                className={`block lg:hidden z-[6000] fixed inset-y-0 left-0 w-60 bg-background transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="py-5 flex items-center px-4">
                    <Link to="/dashboard" className="flex items-center space-x-2 pl-2">
                        <span className="text-2xl font-semibold text-primary">Vokal</span>
                    </Link>
                </div>

                <nav className="px-3 h-[88vh] overflow-y-auto pb-2">
                    {menuItems.map((item, index) => (
                        item.divider ? (
                            <div key={index} className="mt-5 mb-2">
                                <p className="px-1 text-xs font-medium text-gray-500 tracking-wider">
                                    {item.label}
                                </p>
                            </div>
                        ) : (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-3 py-1.5 rounded-md mb-1 text-sm ${isActive(item.path)
                                    ? 'bg-secondary text-primary font-medium'
                                    : 'text-gray-800 hover:bg-secondary'
                                    }`}
                                onClick={onClose}
                            >
                                <item.icon className={`h-[18px] w-[18px] ${isActive(item.path) ? 'text-primary' : 'text-gray-600'
                                    }`} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    ))}
                </nav>
            </aside>
        </>
    )
}

export default MobileSidebar