import React from 'react';
import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FileText, PiggyBank, Gift, Car, Heart, Droplet, Cookie } from 'lucide-react';



export default function Component() {
  const [projects] = useState([
    {
      id: 1,
      title: 'Historial de ventas',
      date: '14 de septiembre, 2024',
      icon: <FileText className="text-primary" />
    },
    {
      id: 2,
      title: 'Ahorros',
      date: '13 de septiembre, 2024',
      icon: <PiggyBank className="text-success" />
    },
    {
      id: 3,
      title: 'Gastos cumpleaños',
      date: '12 de septiembre, 2024',
      icon: <Gift className="text-warning" />
    },
    {
      id: 4,
      title: 'Repuestos auto',
      date: '11 de septiembre, 2024',
      icon: <Car className="text-danger" />
    },
    {
        id: 5,
        title: 'Gastos médicos',
        date: '10 de septiembre, 2024',
        icon: <Heart className="text-info" />
    },      
    {
      id: 6,
      title: 'Proyecto aguas',
      date: '09 de septiembre, 2024',
      icon: <Droplet className="text-primary" />
    },
    {
      id: 7,
      title: 'Tienda de galletas',
      date: '08 de septiembre, 2024',
      icon: <Cookie className="text-warning" />
    },
  ])

  return (
    <div className="min-h-screen bg-light">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-4 col-lg-3 p-3 border-end bg-white shadow-sm" style={{ minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">Proyectos recientes</h5>
              <button className="btn btn-success btn-sm">
                + Crear proyecto
              </button>
            </div>

            <div className="list-group">
              {projects.map((project) => (
                <a
                  key={project.id}
                  href="#"
                  className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                >
                  <div className="border rounded p-2 bg-light">
                    {project.icon}
                  </div>
                  <div>
                    <h6 className="mb-0">{project.title}</h6>
                    <small className="text-muted">Fecha de modificación: {project.date}</small>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-8 col-lg-9 p-3">
            <div className="border rounded p-3 bg-white shadow-sm">
              <h5 className="mb-4">Previsualización</h5>
              
              <div className="row g-3">
                <div className="col-12">
                  <div className="border rounded bg-light" style={{ height: '200px' }}></div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded bg-light" style={{ height: '150px' }}></div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded bg-light" style={{ height: '150px' }}></div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded bg-light" style={{ height: '150px' }}></div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded bg-light" style={{ height: '150px' }}></div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded bg-light" style={{ height: '150px' }}></div>
                </div>
              </div>

              <div className="mt-4">
                <button className="btn btn-success w-100">
                  + Añadir proyecto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}