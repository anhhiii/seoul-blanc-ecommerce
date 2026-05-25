import { Router } from 'express';
import { ClientAddressController } from '../../../controllers/v1/client/address.controller.js';
import { AddressService } from '../../../services/address.service.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import {
  createAddressSchema,
  updateAddressSchema,
} from '../../../validations/address.validation.js';

const router = Router();

const addressService = new AddressService();
const addressController = new ClientAddressController(addressService);

router.use(verifyToken);

router.get('/', addressController.getAddresses);
router.post('/', validate(createAddressSchema), addressController.createAddress);
router.get('/:id', addressController.getAddressById);
router.put('/:id', validate(updateAddressSchema), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.put('/:id/set-default', addressController.setDefaultAddress);

export default router;
