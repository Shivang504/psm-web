import { all, fork } from 'redux-saga/effects'
import { attendanceSaga } from './attendanceSaga'
import { authSaga } from './authSaga'
import { dashboardSaga } from './dashboardSaga'
import { inventorySaga } from './inventorySaga'
import { leadsSaga } from './leadsSaga'
import { ordersSaga } from './ordersSaga'
import { profileSaga } from './profileSaga'
import { usersSaga } from './usersSaga'
import { vendorsSaga } from './vendorsSaga'

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(attendanceSaga),
    fork(dashboardSaga),
    fork(inventorySaga),
    fork(leadsSaga),
    fork(ordersSaga),
    fork(profileSaga),
    fork(usersSaga),
    fork(vendorsSaga),
  ])
}
