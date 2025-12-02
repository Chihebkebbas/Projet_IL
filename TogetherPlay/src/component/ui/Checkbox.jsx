import styles from "./Checkbox.module.css";

export default function Checkbox({id,
                                 type = "checkbox",
                                 required = true,
                                 children,
                                 className = "",
                                 ...props}) {

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <input id={id} type={type} required={required} className={styles.checkbox}/>
            <label htmlFor={id} className={styles.label}>
                {children}
            </label>
        </div>
    )
}