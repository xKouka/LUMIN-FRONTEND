import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User, Phone, Mail, MapPin, CreditCard } from "lucide-react"

interface ModalInfoPacienteProps {
    isOpen: boolean;
    onClose: () => void;
    cliente: any; // Using any for flexibility, but ideally should be an interface
}

export default function ModalInfoPaciente({ isOpen, onClose, cliente }: ModalInfoPacienteProps) {
    if (!cliente) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-brand-600" />
                        Información del Paciente
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Nombre */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Paciente</p>
                            <p className="text-base font-semibold text-gray-900">{cliente.paciente_nombre}</p>
                        </div>
                    </div>

                    {/* Cedula */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Cédula</p>
                            <p className="text-base font-medium text-gray-900">{cliente.cedula || 'No registrada'}</p>
                        </div>
                    </div>

                    {/* Contact Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900 truncate" title={cliente.email}>
                                    {cliente.email || 'No registrado'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                <p className="text-base font-medium text-gray-900">{cliente.telefono || 'No registrado'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Direccion */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Dirección</p>
                            <p className="text-sm font-medium text-gray-900">
                                {cliente.direccion || 'No registrada'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
