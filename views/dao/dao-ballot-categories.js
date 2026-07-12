export const ballotCategories = {
    2: 'New price feed symbol proposal',
    1: 'New data source proposal',
    0: 'New cluster organization invitation',
    3: 'General DAO decision'
}

export const ballotCategoryOptions = Object.entries(ballotCategories).map(([key, value]) => ({value: parseInt(key), title: value}))

export const ballotStatuses = {
    0: 'Draft',
    1: 'Accepted',
    2: 'Rejected',
    3: 'Retracted'
}