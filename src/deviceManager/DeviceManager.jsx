import { Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FaSave } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import Loader from '../components/loader/Loader';
import DevicesList from './DevicesList';
import axios from 'axios';
import { toast } from 'sonner';

const DeviceManager = () => {
    const [title, setTitle] = useState("");
    const [sid, setSid] = useState("");
    const [token, setToken] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [apiSecret, setApiSecret] = useState("");
    const [appSid, setAppSid] = useState("");
    const [num, setNum] = useState("");
    const [status, setStatus] = useState("active");
    const [other, setOther] = useState("other");
    const [devices, setDevices] = useState([]);

    const [showDeviceMangerModal, setShowDeviceMangerModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);

    const fetchDevices = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.get(
                'https://vokal-api.oyelabs.com/user/get_my_devices',
                {
                    headers: {
                        'accept': 'application/json',
                        'access-token': authToken
                    }
                }
            );
            if (response.data.success) {
                setDevices(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
            toast.error('Failed to fetch devices');
        }
    };

    useEffect(() => {
        fetchDevices();
        setTimeout(() => setLoading(false), 300);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const authToken = localStorage.getItem('authToken');
            const url = editingDevice 
                ? `https://vokal-api.oyelabs.com/user/update_device/${editingDevice.dataValues.device_id}`
                : 'https://vokal-api.oyelabs.com/user/add_device';

            const method = editingDevice ? 'put' : 'post';

            const response = await axios[method](
                url,
                {
                    sid,
                    title,
                    api_key: apiKey,
                    api_secret: apiSecret,
                    number: num,
                    outgoing_app_sid: appSid,
                    token,
                    status,
                },
                {
                    headers: {
                        'accept': 'application/json',
                        'access-token': authToken,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.success(`Device ${editingDevice ? 'updated' : 'added'} successfully!`);
                setShowDeviceMangerModal(false);
                resetForm();
                fetchDevices();
            }

        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || `Failed to ${editingDevice ? 'update' : 'add'} device`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (deviceId) => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.delete(
                `https://vokal-api.oyelabs.com/user/delete_device/${deviceId}`,
                {
                    headers: {
                        'accept': 'application/json',
                        'access-token': authToken
                    }
                }
            );
            if (response.data.success) {
                toast.success('Device deleted successfully!');
                fetchDevices();
            }
        } catch (error) {
            console.error('Error deleting device:', error);
            toast.error(error.response?.data?.message || 'Failed to delete device');
        }
    };

    const resetForm = () => {
        setTitle("");
        setSid("");
        setToken("");
        setApiKey("");
        setApiSecret("");
        setAppSid("");
        setNum("");
        setStatus("active");
        setOther("");
        setEditingDevice(null);
    };

    const handleEdit = (device) => {
        setEditingDevice(device);
        const data = device.dataValues;
        setTitle(data.title);
        setSid(data.sid);
        setToken(data.token);
        setApiKey(data.api_key);
        setApiSecret(data.api_secret);
        setAppSid(data.outgoing_app_sid);
        setNum(data.number);
        setShowDeviceMangerModal(true);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-[50vh] bg-secondary w-full">
            <div className="flex flex-col items-center justify-between mb-8">
                <div className="flex justify-start items-center w-full">
                    <img
                        src='https://sonivo.oneoftheprojects.com/assets/device_img.svg'
                        alt=''
                        className='h-24 w-24'
                    />
                </div>
                <div className='w-full sm:justify-between justify-start sm:items-center items-start sm:flex-row flex flex-col'>

                    <div className='space-y-2 flex flex-col'>
                        <h1 className="text-2xl font-medium text-primary"> Device Manager</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Dashboard</span>
                            <span>•</span>
                            <span> Device Manager</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowDeviceMangerModal(true);
                        }}
                        className="text-sm self-end bg-primary-400 text-background mt-4 py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-center gap-2"
                    >
                        <Plus className='text-background' size={20} />
                        Add Devices
                    </button>
                </div>
            </div>
            
            {devices.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No devices found</div>
                    <button
                        onClick={() => setShowDeviceMangerModal(true)}
                        className="text-sm bg-primary-400 text-background py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-center gap-2"
                    >
                        <Plus className='text-background' size={20} />
                        Add Your First Device
                    </button>
                </div>
            ) : (
                devices.map(device => (
                    <DevicesList 
                        key={device.dataValues.device_id} 
                        device={device.dataValues} 
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                ))
            )}

            {showDeviceMangerModal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999999]">
                        <div className="bg-background rounded-2xl shadow-lg w-full md:w-[600px]">
                            <div className='flex justify-start bg-secondary mb-4 rounded-t-2xl px-6 py-4 items-center w-full gap-6'>
                                <IoMdClose className='text-gray-600 cursor-pointer' size={20} onClick={() => setShowDeviceMangerModal(false)} />
                                <h2 className="text-lg font-semibold text-center">
                                    {editingDevice ? 'Edit Device' : 'Add New Device'}
                                </h2>
                            </div>

                            <form className="space-y-4 px-6 py-3" onSubmit={handleSubmit}>
                                <div className="relative group">
                                    <div className="absolute -top-2.5 left-3 bg-background px-1
               transition-all duration-300
               text-primary text-[11px]">
                                        Title
                                    </div>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full pl-5 text-sm rounded-[9px] bg-background pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-[1px] focus:ring-primary focus:border-primary"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute -top-2.5 left-3 bg-background px-1
               transition-all duration-300
               text-primary text-[11px]">
                                        SID
                                    </div>
                                    <input
                                        type="text"
                                        value={sid}
                                        onChange={(e) => setSid(e.target.value)}
                                        className="w-full pl-5 text-sm rounded-[9px] bg-background pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-[1px] focus:ring-primary focus:border-primary"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute -top-2.5 left-3 bg-background px-1
               transition-all duration-300
               text-primary text-[11px]">
                                        Token
                                    </div>
                                    <input
                                        type="text"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        className="w-full pl-5 text-sm rounded-[9px] bg-background pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-[1px] focus:ring-primary focus:border-primary"
                                        placeholder=""
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <div className="absolute -top-2.5 left-3 bg-background px-1
               transition-all duration-300
               text-primary text-[11px]">
                                        Api Key
                                    </div>
                                    <input
                                        type="text"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full pl-5 text-sm rounded-[9px] bg-background pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-[1px] focus:ring-primary focus:border-primary"
                                        placeholder=""
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <div className="absolute -top-2.5 left-3 bg-background px-1
               transition-all duration-300
               text-primary text-[11px]">
                                        Api Secret
                                    </div>
                                    <input
                                        type="text"
                                        value={apiSecret}
                                        onChange={(e) => setApiSecret(e.target.value)}
                                        className="w-full pl-5 text-sm rounded-[9px] bg-background pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-[1px] focus:ring-primary focus:border-primary"
                                        placeholder=""
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <div className="absolute -top-2.5 left-3 bg-background px-1
               transition-all duration-300
               text-primary text-[11px]">
                                        Outgoing app Sid
                                    </div>
                                    <input
                                        type="text"
                                        value={appSid}
                                        onChange={(e) => setAppSid(e.target.value)}
                                        className="w-full pl-5 text-sm rounded-[9px] bg-background pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-[1px] focus:ring-primary focus:border-primary"
                                        placeholder=""
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <div className="absolute -top-2.5 left-3 bg-background px-1
               transition-all duration-300
               text-primary text-[11px]">
                                        Number
                                    </div>
                                    <input
                                        type="text"
                                        value={num}
                                        onChange={(e) => setNum(e.target.value)}
                                        className="w-full pl-5 text-sm rounded-[9px] bg-background pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-[1px] focus:ring-primary focus:border-primary"
                                        placeholder=""
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full text-sm bg-primary-400 text-background mt-4 py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {submitting ? (
                                        'Saving...'
                                    ) : (
                                        <>
                                            <FaSave className='text-background text-lg' />
                                            {editingDevice ? 'Update' : 'Save'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default DeviceManager