import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { WorkflowList } from './pages/WorkflowList';
import { WorkflowCreate } from './pages/WorkflowCreate';
import { WorkflowEdit } from './pages/WorkflowEdit';
import { RoleList } from './pages/RoleList';
import { RoleCreate } from './pages/RoleCreate';
import { RoleEdit } from './pages/RoleEdit';
import { UserList } from './pages/UserList';
import { UserCreate } from './pages/UserCreate';
import { UserEdit } from './pages/UserEdit';
import { PurchaseRequests } from './pages/PurchaseRequests';
import { PurchaseRequestCreate } from './pages/PurchaseRequestCreate';
import { PurchaseRequestDetail } from './pages/PurchaseRequestDetail';
import { PurchaseRequestEdit } from './pages/PurchaseRequestEdit';
import { ProductList } from './pages/ProductList';
import { ProductCreate } from './pages/ProductCreate';
import { ProductDetail } from './pages/ProductDetail';
import { ProductEdit } from './pages/ProductEdit';
import { SupplierList } from './pages/SupplierList';
import { SupplierCreate } from './pages/SupplierCreate';
import { SupplierEdit } from './pages/SupplierEdit';
import { PublicSupplierQuote } from './pages/PublicSupplierQuote';
import { WarehouseList } from './pages/WarehouseList';
import { WarehouseDetail } from './pages/WarehouseDetail';
import { WarehouseCreate } from './pages/WarehouseCreate';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { PurchaseOrderDetail } from './pages/PurchaseOrderDetail';
import { StockManagement } from './pages/StockManagement';
import { StockDetail } from './pages/StockDetail';
import { SchoolList } from './pages/SchoolList';
import { SchoolCreate } from './pages/SchoolCreate';
import { SchoolDetail } from './pages/SchoolDetail';
import { SchoolEdit } from './pages/SchoolEdit';
import { PersonnelList } from './pages/PersonnelList';
import { PersonnelCreate } from './pages/PersonnelCreate';
import { PersonnelDetail } from './pages/PersonnelDetail';
import { PrivateRoute } from './components/PrivateRoute';
import TransferList from './components/transfer/TransferList';
import TransferCreate from './components/transfer/TransferCreate';
import TransferDetail from './components/transfer/TransferDetail';
import { CategoryCreate } from './pages/CategoryCreate';
import { CategoryList } from './pages/CategoryList';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/workflows" 
                element={
                  <PrivateRoute>
                    <WorkflowList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/workflows/create" 
                element={
                  <PrivateRoute>
                    <WorkflowCreate />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/workflows/edit/:id" 
                element={
                  <PrivateRoute>
                    <WorkflowEdit />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/roles" 
                element={
                  <PrivateRoute>
                    <RoleList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/roles/create" 
                element={
                  <PrivateRoute>
                    <RoleCreate />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/roles/edit/:id" 
                element={
                  <PrivateRoute>
                    <RoleEdit />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/openpositions" 
                element={
                  <PrivateRoute>
                    <Navigate to="/dashboard" replace />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <PrivateRoute>
                    <UserList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/users/create" 
                element={
                  <PrivateRoute>
                    <UserCreate />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/users/edit/:id" 
                element={
                  <PrivateRoute>
                    <UserEdit />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/purchase-requests" 
                element={
                  <PrivateRoute>
                    <PurchaseRequests />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/purchase-requests/create" 
                element={
                  <PrivateRoute>
                    <PurchaseRequestCreate />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/purchase-requests/:id" 
                element={
                  <PrivateRoute>
                    <PurchaseRequestDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/purchase-requests/edit/:id" 
                element={
                  <PrivateRoute>
                    <PurchaseRequestEdit />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/products" 
                element={
                  <PrivateRoute>
                    <ProductList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/products/create" 
                element={
                  <PrivateRoute>
                    <ProductCreate />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/products/:id" 
                element={
                  <PrivateRoute>
                    <ProductDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/products/edit/:id" 
                element={
                  <PrivateRoute>
                    <ProductEdit />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/suppliers" 
                element={
                  <PrivateRoute>
                    <SupplierList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/suppliers/create" 
                element={
                  <PrivateRoute>
                    <SupplierCreate />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/suppliers/edit/:id" 
                element={
                  <PrivateRoute>
                    <SupplierEdit />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/supplier-quote/:quoteUid" 
                element={<PublicSupplierQuote />} 
              />
              <Route 
                path="/warehouses" 
                element={
                  <PrivateRoute>
                    <WarehouseList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/warehouses/create" 
                element={
                  <PrivateRoute>
                    <WarehouseCreate />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/warehouses/:id" 
                element={
                  <PrivateRoute>
                    <WarehouseDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/purchase-orders" 
                element={
                  <PrivateRoute>
                    <PurchaseOrders />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/purchase-orders/:id" 
                element={
                  <PrivateRoute>
                    <PurchaseOrderDetail />
                  </PrivateRoute>
                } 
              />
              <Route
                path="/stock-management"
                element={
                  <PrivateRoute>
                    <StockManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/stock-management/:id"
                element={
                  <PrivateRoute>
                    <StockDetail />
                  </PrivateRoute>
                }
              />
              <Route 
                path="/schools" 
                element={
                  <PrivateRoute>
                    <SchoolList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/schools/create" 
                element={
                  <PrivateRoute>
                    <SchoolCreate />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/schools/:id" 
                element={
                  <PrivateRoute>
                    <SchoolDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/schools/edit/:id" 
                element={
                  <PrivateRoute>
                    <SchoolEdit />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/personnel" 
                element={
                  <PrivateRoute>
                    <PersonnelList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/personnel/create" 
                element={
                  <PrivateRoute>
                    <PersonnelCreate />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/personnel/:id" 
                element={
                  <PrivateRoute>
                    <PersonnelDetail />
                  </PrivateRoute>
                } 
              />
              <Route path="/transfers" element={<PrivateRoute><TransferList /></PrivateRoute>} />
              <Route path="/categories" element={<PrivateRoute><CategoryList /></PrivateRoute>} />
              <Route path="/categories/create" element={<PrivateRoute><CategoryCreate /></PrivateRoute>} />
              <Route path="/transfers/create" element={<PrivateRoute><TransferCreate /></PrivateRoute>} />
              <Route path="/transfers/:id" element={<PrivateRoute><TransferDetail /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;